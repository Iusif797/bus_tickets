import React from 'react';

type AnchorLike = {
    asLink: true;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

type ButtonLike = {
    asLink?: false;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonProps = AnchorLike | ButtonLike;

const Button: React.FC<ButtonProps> = (props) => {
    if ('asLink' in props && props.asLink) {
        const { children, className, ...rest } = props;
        return (
            <a className={`btn${className ? ' ' + className : ''}`} {...rest}>
                {children}
            </a>
        );
    }
    const { children, className, ...rest } = props as ButtonLike;
    return (
        <button className={`btn${className ? ' ' + className : ''}`} {...rest}>
            {children}
        </button>
    );
};

export default Button;
