'use client';

import { createContext, useContext, useId, useState } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import './glass.css';

export { LensStage } from './lens-stage';

export type GlassMaterial = 'solid' | 'lens';
export type GlassAppearance = 'system' | 'light' | 'dark';
export type GlassOption = { value: string; label: string; disabled?: boolean };

const SolidContext = createContext(false);

function classes(base: string, className?: string) {
	return className ? `${base} ${className}` : base;
}

type ProviderProps = ComponentPropsWithoutRef<'div'> & {
	as?: 'div' | 'main' | 'section';
	appearance?: GlassAppearance;
	blur?: number;
	solid?: boolean;
};

export function GlassProvider({
	as: Element = 'div',
	appearance,
	blur,
	solid,
	className,
	style,
	...props
}: ProviderProps) {
	const parentSolid = useContext(SolidContext);
	const solidMode = solid ?? parentSolid;
	const providerStyle =
		blur !== undefined && Number.isFinite(blur)
			? ({ ...style, '--glass-blur': `${Math.max(0, blur)}px` } as CSSProperties)
			: style;
	return (
		<SolidContext.Provider value={solidMode}>
			<Element
				{...props}
				className={classes('glass-provider', className)}
				data-glass-appearance={appearance}
				data-glass-solid={solidMode}
				style={providerStyle}
			/>
		</SolidContext.Provider>
	);
}

type SurfaceProps = ComponentPropsWithoutRef<'div'> & { material?: GlassMaterial };

export function GlassSurface({ material = 'lens', className, ...props }: SurfaceProps) {
	const solid = useContext(SolidContext);
	return (
		<div
			{...props}
			className={classes('glass-surface', className)}
			data-material={solid ? 'solid' : material}
		/>
	);
}

export function GlassPanel({ className, ...props }: SurfaceProps) {
	return <GlassSurface {...props} className={classes('glass-panel', className)} />;
}

type ButtonProps = ComponentPropsWithoutRef<'button'> & { material?: GlassMaterial | 'embedded' };

export function GlassButton({
	material = 'solid',
	type = 'button',
	className,
	children,
	...props
}: ButtonProps) {
	const solid = useContext(SolidContext);
	return (
		<button
			{...props}
			type={type}
			className={classes('glass-surface glass-button', className)}
			data-material={solid ? 'solid' : material}
		>
			<span className="glass-button-label">{children}</span>
		</button>
	);
}

type AvatarProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
	src?: string;
	alt: string;
	fallback?: string;
};

export function GlassAvatar({ src, alt, fallback, className, ...props }: AvatarProps) {
	const [failed, setFailed] = useState<string>();
	return (
		<span
			{...props}
			className={classes('glass-avatar', className)}
			role={alt ? 'img' : undefined}
			aria-label={alt || undefined}
			aria-hidden={alt ? undefined : true}
		>
			{src && src !== failed ? (
				<img
					key={src}
					src={src}
					alt=""
					onLoad={() => setFailed(undefined)}
					onError={() => setFailed(src)}
				/>
			) : (
				<span aria-hidden="true">
					{fallback ??
						alt
							.trim()
							.split(/\s+/)
							.slice(0, 2)
							.map((word) => word[0])
							.join('')}
				</span>
			)}
		</span>
	);
}

export function GlassKbd({ className, ...props }: ComponentPropsWithoutRef<'kbd'>) {
	return <kbd {...props} className={classes('glass-kbd', className)} />;
}

type ScrollAreaProps = Omit<ComponentPropsWithoutRef<'div'>, 'role' | 'tabIndex' | 'aria-label'> & {
	label: string;
};

export function GlassScrollArea({ label, className, ...props }: ScrollAreaProps) {
	return (
		<div
			{...props}
			role="region"
			aria-label={label}
			tabIndex={0}
			className={classes('glass-scroll-area', className)}
		/>
	);
}

type InputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
	type?:
		| 'text'
		| 'search'
		| 'email'
		| 'password'
		| 'tel'
		| 'url'
		| 'number'
		| 'date'
		| 'time'
		| 'datetime-local'
		| 'month'
		| 'week';
};

export function GlassInput({ className, type = 'text', ...props }: InputProps) {
	return <input {...props} type={type} className={classes('glass-field', className)} />;
}

export function GlassTextarea({ className, ...props }: ComponentPropsWithoutRef<'textarea'>) {
	return <textarea {...props} className={classes('glass-field glass-textarea', className)} />;
}

type SelectProps = Omit<ComponentPropsWithoutRef<'select'>, 'children' | 'multiple'> & {
	options: readonly GlassOption[];
};

export function GlassSelect({ options, className, ...props }: SelectProps) {
	return (
		<select {...props} className={classes('glass-field', className)}>
			{options.map(({ value, label, disabled }) => (
				<option key={value} value={value} disabled={disabled}>
					{label}
				</option>
			))}
		</select>
	);
}

type CheckProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>;

export function GlassCheckbox({ className, ...props }: CheckProps) {
	return <input {...props} type="checkbox" className={classes('glass-check', className)} />;
}

export function GlassSwitch({ className, ...props }: Omit<CheckProps, 'role'>) {
	return (
		<input
			{...props}
			{...{ switch: '' }}
			type="checkbox"
			role="switch"
			className={classes('glass-check glass-switch', className)}
		/>
	);
}

export function GlassSlider({
	className,
	...props
}: Omit<CheckProps, 'value' | 'defaultValue'> & { value?: number; defaultValue?: number }) {
	return <input {...props} type="range" className={classes('glass-slider', className)} />;
}

type RadioGroupProps = Omit<
	ComponentPropsWithoutRef<'fieldset'>,
	'children' | 'onChange' | 'defaultValue'
> & {
	label: ReactNode;
	options: readonly GlassOption[];
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	required?: boolean;
};

function RadioGroup({
	label,
	options,
	value,
	defaultValue,
	onValueChange,
	name,
	form,
	required,
	className,
	segmented,
	...props
}: RadioGroupProps & { segmented?: boolean }) {
	const id = useId();
	return (
		<fieldset {...props} form={form} className={classes('glass-radio-group', className)}>
			<legend>{label}</legend>
			<div className={classes('glass-options', segmented ? 'glass-segments' : undefined)}>
				{options.map((option, index) => {
					const inputId = `${id}-${index}`;
					const selection =
						value === undefined
							? { defaultChecked: defaultValue === option.value }
							: { checked: value === option.value };
					return (
						<div key={option.value} className="glass-option">
							<input
								{...selection}
								id={inputId}
								type="radio"
								name={name ?? id}
								form={form}
								required={required}
								value={option.value}
								disabled={option.disabled}
								onChange={() => onValueChange?.(option.value)}
							/>
							<label htmlFor={inputId}>{option.label}</label>
						</div>
					);
				})}
			</div>
		</fieldset>
	);
}

export function GlassRadioGroup(props: RadioGroupProps) {
	return <RadioGroup {...props} />;
}

export function GlassSegmentedControl(props: RadioGroupProps) {
	return <RadioGroup {...props} segmented />;
}
