export type LensBackdrop = 'rain' | 'prism' | 'grid' | 'flat';
export type LensBounds = { rect: DOMRectReadOnly; radius: number; circular: boolean };
export const maxLenses = 64;
const backdropModes: Record<LensBackdrop, number> = { rain: 0, prism: 1, grid: 2, flat: 3 };

export const photoOverscan = 1.2;

const blurRadius = (photo: boolean) => (photo ? 10 : 6);

const vertexSource = `#version 300 es
void main() {
	vec2 position = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
	gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}`;

const fragmentSource = (photo: boolean) => `#version 300 es
${photo ? '#define PHOTO' : ''}
precision highp float;
uniform vec2 resolution;
uniform vec2 stageSize;
uniform float scale;
uniform vec4 lenses[${maxLenses}];
uniform vec3 profiles[${maxLenses}];
uniform int lensCount;
uniform int backdropMode;
uniform vec2 lightPosition;
uniform bool optical;
uniform float ripple;
uniform float elapsed;
uniform float dark;
uniform float blur;
uniform int blurPass;
uniform vec2 blurResolution;
uniform float blurWeights[${blurRadius(photo) + 1}];
uniform sampler2D blurTexture;
uniform float refraction;
uniform sampler2D displacementMap;
out vec4 color;
#ifdef PHOTO
uniform sampler2D backdropPhoto;
uniform vec2 photoSize;
uniform vec2 photoPosition;
#endif

float streaks(vec2 p, vec2 cellSize, float speed, float layer) {
	p.x -= p.y * 0.19;
	p.y -= elapsed * speed;
	float column = floor(p.x / cellSize.x);
	p.y += fract(sin(column * 47.21 + layer) * 43758.54) * cellSize.y;
	vec2 cell = floor(p / cellSize);
	vec2 local = fract(p / cellSize) * cellSize;
	float seed = fract(sin(dot(cell, vec2(17.13, 43.71)) + layer) * 43758.54);
	float center = mix(4.0, cellSize.x - 4.0, seed);
	float halfLength = 8.0 + seed * 13.0;
	vec2 line = local - vec2(center, cellSize.y * 0.5);
	line.y -= clamp(line.y, -halfLength, halfLength);
	return 1.0 - smoothstep(1.1, 2.4, length(line));
}

vec3 prismBand(vec3 base, vec2 point, vec2 size, float angle, vec3 a, vec3 b, vec3 c, vec3 stops) {
	vec2 local = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * point;
	float mask = 1.0 - smoothstep(-0.006, 0.006, length(local / size) - 1.0);
	float stripe = mod(local.x + size.x, stops.z);
	return mix(base, stripe < stops.x ? a : stripe < stops.y ? b : c, mask);
}

vec3 scene(vec2 p) {
#ifdef PHOTO
	vec2 viewSize = stageSize;
	float cover = max(viewSize.x / photoSize.x, viewSize.y / photoSize.y) * ${photoOverscan};
	vec2 imageSize = photoSize * cover;
	vec2 uv = (p - (viewSize - imageSize) * photoPosition) / imageSize;
	return texture(backdropPhoto, uv).rgb;
#else
	vec2 viewSize = stageSize;
	vec2 uv = p / viewSize;
	vec3 flatColor = vec3(0.655, 0.635, 0.867);
	if (backdropMode == 3) return flatColor;
	if (backdropMode == 2) {
		float tile = mod(floor(p.x / 20.0) + floor(p.y / 20.0), 2.0);
		return mix(vec3(0.90, 0.875, 0.98), vec3(0.337, 0.263, 0.541), tile);
	}
	if (backdropMode == 1) {
		vec2 size = viewSize * vec2(0.375, 0.46);
		vec3 base = prismBand(flatColor, p - viewSize * vec2(0.235, 0.18), size, -0.471,
			vec3(0.427, 0.278, 0.78), vec3(0.667, 0.459, 0.937), vec3(0.824, 0.733, 0.976), vec3(12.0, 26.0, 38.0));
		base = prismBand(base, p - viewSize * vec2(0.755, 0.70), size, 0.524,
			vec3(1.0, 0.584, 0.388), vec3(1.0, 0.753, 0.533), vec3(0.969, 0.863, 0.663), vec3(16.0, 28.0, 39.0));
		return prismBand(base, p - viewSize * vec2(0.505, 1.08), size, 0.209,
			vec3(0.302, 0.392, 0.631), vec3(0.525, 0.639, 0.871), vec3(0.961, 0.965, 1.0), vec3(11.0, 23.0, 40.0));
	}
	vec3 cool = mix(vec3(0.73, 0.83, 0.94), vec3(0.10, 0.18, 0.31), dark);
	vec3 lilac = mix(vec3(0.65, 0.66, 0.87), vec3(0.32, 0.26, 0.43), dark);
	vec3 sky = mix(cool, lilac, smoothstep(0.12, 1.05, uv.x * 0.76 + uv.y * 0.28));
	sky += 0.16 * exp(-7.5 * dot(uv - vec2(0.24, 0.28), uv - vec2(0.24, 0.28)));
	vec3 rain = mix(vec3(0.16, 0.28, 0.46), vec3(0.84, 0.94, 1.0), dark);
	float far = streaks(p + vec2(12.0, 0.0), vec2(19.0, 74.0), 98.0, 4.0);
	float near = streaks(p, vec2(27.0, 94.0), 187.0, 0.0);
	return mix(sky, rain, max(far * 0.30, near * 0.88));
#endif
}

float distanceToRim(vec2 p, vec4 lens, float cornerRadius) {
	float radius = min(cornerRadius, min(lens.z, lens.w) * 0.5);
	vec2 q = abs(p - lens.xy - lens.zw * 0.5) - lens.zw * 0.5 + radius;
	return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
}

vec3 blurBackdrop(vec2 uv) {
	vec2 stepSize = blurPass == 1 ? vec2(1.0 / blurResolution.x, 0.0) : vec2(0.0, 1.0 / blurResolution.y);
	vec3 result = vec3(0.0);
	for (int tap = -${blurRadius(photo)}; tap <= ${blurRadius(photo)}; ++tap) {
		vec2 sampleUv = clamp(uv + float(tap) * stepSize, vec2(0.0), vec2(1.0));
		vec3 sampleColor = blurPass == 1
			? scene(vec2(sampleUv.x, 1.0 - sampleUv.y) * stageSize)
			: texture(blurTexture, sampleUv).rgb;
		result += sampleColor * blurWeights[abs(tap)];
	}
	return result;
}

vec3 frosted(vec2 p) {
	if (blur <= 0.0) return scene(p);
	vec2 uv = p / stageSize;
	return texture(blurTexture, vec2(uv.x, 1.0 - uv.y)).rgb;
}

float easeProfileEdge(float position) {
	float outer = max(0.0, abs(position) - 0.8);
	return position - sign(position) * 2.5 * outer * outer;
}

float rectangularBend(float position) {
	float axis = easeProfileEdge(position);
	float squared = axis * axis;
	float fourth = squared * squared;
	// Approximate the map's centerline continuously so large panels don't magnify byte-sized steps.
	return -axis * (0.216 + 0.18 * fourth + 0.08 * fourth * fourth);
}

void main() {
	if (blurPass != 0) {
		color = vec4(blurBackdrop(gl_FragCoord.xy / blurResolution), 1.0);
		return;
	}
	vec2 p = vec2(gl_FragCoord.x, resolution.y - gl_FragCoord.y) / resolution * stageSize;
	vec3 base = scene(p);
	vec2 samplePoint = p;
	vec2 fringe = vec2(0.0);
	float coverage = 0.0;
	float highlight = 0.0;
	for (int i = 0; i < lensCount; ++i) {
		vec4 lens = lenses[i];
		vec3 profile = profiles[i];
		bool circular = profile.z > 0.5;
		vec2 center = lens.xy + lens.zw * 0.5;
		vec3 light = normalize(vec3(lightPosition - center, max(70.0, lens.w * 0.75)));
		float edge = distanceToRim(p, lens, profile.x);

		// Keep the optical edge beneath the CSS rim, even on fractional CSS pixels.
		float antialias = smoothstep(-0.75, 0.75, (0.75 - edge) * scale);
		if (antialias <= coverage) continue;
		coverage = antialias;
		float depth = max(0.0, -edge);
		vec2 uv = (p - lens.xy) / lens.zw;
		vec2 local = clamp(uv * 2.0 - 1.0, -1.0, 1.0);
		vec2 normal = local;
		vec2 offset;
		if (circular) {
			// Keep the center of the profile and ease off its steep outer ring.
			float radial = min(length(local), 1.0);
			float sampleRadius = easeProfileEdge(radial);
			vec2 mapUv = 0.5 + 0.5 * local * sampleRadius / max(length(local), 0.0001);
			offset = texture(displacementMap, mapUv).rg - 0.5;
		} else {
			offset = vec2(rectangularBend(local.x), rectangularBend(local.y));
			normal = sign(local) * pow(abs(local), vec2(5.0));
		}
		normal /= max(0.0001, length(normal));
		vec2 waves = vec2(sin(p.y * 0.145 + sin(p.x * 0.092)), cos(p.x * 0.13 - sin(p.y * 0.081)));
		float bendSize = circular ? profile.y : min(profile.y, 256.0);
		samplePoint = p + offset * refraction * bendSize
			+ waves * ripple * 0.27 * smoothstep(2.0, 16.0, depth);
		if (optical) {
			float bevelWidth = clamp(profile.y * 0.035, 2.5, 7.0);
			float bevel = 1.0 - smoothstep(0.0, bevelWidth, depth);
			fringe = normal * bevel * min(2.4, abs(refraction * profile.y) * 0.045);
			fringe *= smoothstep(0.75, 2.5, depth);
			float facing = dot(normal, light.xy);
			float primary = smoothstep(0.0, 0.75, facing);
			float secondary = smoothstep(0.1, 0.85, -facing);
			highlight = bevel * (0.03 + 0.27 * primary + 0.08 * secondary);
		}
	}
	if (coverage > 0.0) {
		vec3 filtered = frosted(samplePoint);
		if (dot(fringe, fringe) > 0.01) {
			filtered.r = frosted(samplePoint + fringe).r;
			filtered.b = frosted(samplePoint - fringe).b;
		}
		base = mix(base, mix(filtered, vec3(1.0), highlight), coverage);
	}
	color = vec4(base, 1.0);
}`;

export function createBackdropLens(
	canvas: HTMLCanvasElement,
	map: HTMLImageElement,
	photo?: HTMLImageElement,
	backdrop: LensBackdrop = 'rain',
	optical = false
) {
	const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false });
	if (!gl) return;

	const vertex = gl.createShader(gl.VERTEX_SHADER);
	const fragment = gl.createShader(gl.FRAGMENT_SHADER);
	const program = gl.createProgram();
	if (!vertex || !fragment || !program) {
		gl.deleteShader(vertex);
		gl.deleteShader(fragment);
		gl.deleteProgram(program);
		return;
	}

	gl.shaderSource(vertex, vertexSource);
	gl.shaderSource(fragment, fragmentSource(Boolean(photo)));
	gl.compileShader(vertex);
	gl.compileShader(fragment);
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	gl.deleteShader(vertex);
	gl.deleteShader(fragment);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		gl.deleteProgram(program);
		return;
	}

	gl.useProgram(program);
	const uniforms = {
		resolution: gl.getUniformLocation(program, 'resolution'),
		stageSize: gl.getUniformLocation(program, 'stageSize'),
		scale: gl.getUniformLocation(program, 'scale'),
		lenses: gl.getUniformLocation(program, 'lenses[0]'),
		profiles: gl.getUniformLocation(program, 'profiles[0]'),
		lensCount: gl.getUniformLocation(program, 'lensCount'),
		lightPosition: gl.getUniformLocation(program, 'lightPosition'),
		ripple: gl.getUniformLocation(program, 'ripple'),
		elapsed: gl.getUniformLocation(program, 'elapsed'),
		dark: gl.getUniformLocation(program, 'dark'),
		blur: gl.getUniformLocation(program, 'blur'),
		blurPass: gl.getUniformLocation(program, 'blurPass'),
		blurResolution: gl.getUniformLocation(program, 'blurResolution'),
		blurWeights: gl.getUniformLocation(program, 'blurWeights[0]'),
		blurTexture: gl.getUniformLocation(program, 'blurTexture'),
		refraction: gl.getUniformLocation(program, 'refraction'),
		photoSize: gl.getUniformLocation(program, 'photoSize'),
		photoPosition: gl.getUniformLocation(program, 'photoPosition')
	};

	gl.uniform1i(gl.getUniformLocation(program, 'backdropMode'), backdropModes[backdrop]);
	gl.uniform1i(gl.getUniformLocation(program, 'optical'), Number(optical));

	const mapTexture = gl.createTexture();
	const texture = photo ? gl.createTexture() : null;
	if (!mapTexture || (photo && !texture)) {
		gl.deleteTexture(mapTexture);
		gl.deleteTexture(texture);
		gl.deleteProgram(program);
		return;
	}

	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, mapTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, map);
	gl.uniform1i(gl.getUniformLocation(program, 'displacementMap'), 1);
	gl.uniform1i(uniforms.blurTexture, 1);
	gl.activeTexture(gl.TEXTURE0);

	const horizontalTexture = gl.createTexture();
	const blurredTexture = gl.createTexture();
	const blurFramebuffer = gl.createFramebuffer();
	const weights = new Float32Array(blurRadius(Boolean(photo)) + 1);
	let targetWidth = 0;
	let targetHeight = 0;
	let deviceScale = 1;
	let stageWidth = 0;
	let stageHeight = 0;
	let blurredFrame = '';

	function drawBlur(sigma: number, key: string) {
		if (!gl || !horizontalTexture || !blurredTexture || !blurFramebuffer) return false;
		const sampleSpacing = Math.max(1 / deviceScale, sigma / (photo ? 4 : 2.4));
		const width = Math.max(1, Math.round(canvas.width / (deviceScale * sampleSpacing)));
		const height = Math.max(1, Math.round(canvas.height / (deviceScale * sampleSpacing)));
		gl.activeTexture(gl.TEXTURE2);
		gl.uniform1i(uniforms.blurTexture, 2);
		if (key !== blurredFrame || width !== targetWidth || height !== targetHeight) {
			if (width !== targetWidth || height !== targetHeight) {
				for (const target of [horizontalTexture, blurredTexture]) {
					gl.bindTexture(gl.TEXTURE_2D, target);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
				}
				targetWidth = width;
				targetHeight = height;
			}
			const sampleSigma = sigma / sampleSpacing;
			let total = 0;
			for (let index = 0; index < weights.length; index++) {
				const distance = index / sampleSigma;
				weights[index] = Math.exp(-0.5 * distance * distance);
				total += weights[index] * (index === 0 ? 1 : 2);
			}
			for (let index = 0; index < weights.length; index++) weights[index] /= total;

			gl.bindFramebuffer(gl.FRAMEBUFFER, blurFramebuffer);
			gl.viewport(0, 0, width, height);
			gl.uniform2f(uniforms.blurResolution, width, height);
			gl.uniform1fv(uniforms.blurWeights, weights);

			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, horizontalTexture, 0);
			gl.bindTexture(gl.TEXTURE_2D, blurredTexture);
			gl.uniform1i(uniforms.blurPass, 1);
			gl.drawArrays(gl.TRIANGLES, 0, 3);

			gl.bindTexture(gl.TEXTURE_2D, horizontalTexture);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, blurredTexture, 0);
			gl.uniform1i(uniforms.blurPass, 2);
			gl.drawArrays(gl.TRIANGLES, 0, 3);

			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.viewport(0, 0, canvas.width, canvas.height);
			gl.uniform1i(uniforms.blurPass, 0);
			blurredFrame = key;
		}
		gl.bindTexture(gl.TEXTURE_2D, blurredTexture);
		gl.activeTexture(gl.TEXTURE0);
		return true;
	}

	const lensData = new Float32Array(maxLenses * 4);
	const profileData = new Float32Array(maxLenses * 3);

	function uploadPhoto(image: HTMLImageElement) {
		if (!texture || !gl) return false;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		try {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		} catch {
			return false;
		}
		if (gl.getError() !== gl.NO_ERROR) return false;
		gl.uniform2f(uniforms.photoSize, image.naturalWidth, image.naturalHeight);
		blurredFrame = '';
		return true;
	}

	if (photo) {
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.uniform1i(gl.getUniformLocation(program, 'backdropPhoto'), 0);
		if (!uploadPhoto(photo)) {
			gl.deleteFramebuffer(blurFramebuffer);
			gl.deleteTexture(horizontalTexture);
			gl.deleteTexture(blurredTexture);
			gl.deleteTexture(texture);
			gl.deleteTexture(mapTexture);
			gl.deleteProgram(program);
			return;
		}
	}

	return {
		uploadPhoto,
		resize(width: number, height: number, scale: number, lenses: LensBounds[]) {
			const pixelWidth = Math.round(width * scale);
			const pixelHeight = Math.round(height * scale);
			if (width !== stageWidth || height !== stageHeight) blurredFrame = '';
			stageWidth = width;
			stageHeight = height;
			if (canvas.width !== pixelWidth || canvas.height !== pixelHeight || deviceScale !== scale) {
				blurredFrame = '';
				deviceScale = scale;
				canvas.width = pixelWidth;
				canvas.height = pixelHeight;
			}
			gl.viewport(0, 0, pixelWidth, pixelHeight);
			gl.uniform2f(uniforms.resolution, pixelWidth, pixelHeight);
			gl.uniform2f(uniforms.stageSize, width, height);
			gl.uniform1f(uniforms.scale, scale);
			const count = Math.min(lenses.length, maxLenses);
			for (let index = 0; index < count; index++) {
				const { rect, radius, circular } = lenses[index];
				lensData.set([rect.x, rect.y, rect.width, rect.height], index * 4);
				profileData.set(
					[radius, Math.min(rect.width, rect.height), Number(circular)],
					index * 3
				);
			}
			gl.uniform1i(uniforms.lensCount, count);
			gl.uniform4fv(uniforms.lenses, lensData);
			gl.uniform3fv(uniforms.profiles, profileData);
		},
		draw(
			elapsed: number,
			dark: boolean,
			blur: number,
			refract: boolean,
			photoX: number,
			photoY: number,
			strength: number,
			light: readonly [number, number],
			ripple: number
		) {
			gl.uniform1f(uniforms.elapsed, elapsed);
			gl.uniform1f(uniforms.dark, Number(dark));

			gl.uniform1f(uniforms.refraction, refract ? strength : 0);
			gl.uniform2f(uniforms.lightPosition, ...light);
			gl.uniform1f(uniforms.ripple, refract ? ripple : 0);
			gl.uniform2f(uniforms.photoPosition, photoX / 100, photoY / 100);
			const sigma = Math.min(32, Math.max(0, blur));
			const blurred = sigma > 0 && drawBlur(sigma, `${elapsed}:${dark}:${sigma}:${photoX}:${photoY}`);
			gl.uniform1f(uniforms.blur, blurred ? sigma : 0);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		},
		dispose() {
			gl.deleteFramebuffer(blurFramebuffer);
			gl.deleteTexture(horizontalTexture);
			gl.deleteTexture(blurredTexture);
			gl.deleteTexture(mapTexture);
			gl.deleteTexture(texture);
			gl.deleteProgram(program);
		}
	};
}
