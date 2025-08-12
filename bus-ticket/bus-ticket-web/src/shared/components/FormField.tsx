import React from 'react';

type Props = {
    label: string;
    children: React.ReactNode;
};

const FormField: React.FC<Props> = ({ label, children }) => {
    return (
        <label className="field">
            <span className="label">{label}</span>
            {children}
        </label>
    );
};

export default FormField;



