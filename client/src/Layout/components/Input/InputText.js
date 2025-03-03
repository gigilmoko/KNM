import { useState, useEffect } from "react";

function InputText({labelTitle, labelStyle, type, containerStyle, defaultValue, placeholder, updateFormValue, updateType, readOnly, disabled}) {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    const updateInputValue = (val) => {
        setValue(val);
        updateFormValue({ updateType, value: val });
    };

    return (
        <div className={`form-control w-full ${containerStyle}`}>
            <label className="label">
                <span className={"label-text text-base-content " + labelStyle}>{labelTitle}</span>
            </label>
            <input 
                type={type || "text"} 
                value={value} 
                placeholder={placeholder || ""} 
                onChange={(e) => updateInputValue(e.target.value)} 
                className="input input-bordered w-full" 
                readOnly={readOnly} 
                disabled={disabled}
            />
        </div>
    );
}

export default InputText;