import React, { useState } from 'react';
import { useID } from 'src/views/idOrSlugContext'; // Assuming useID is your custom hook to access context

const Configuration = () => {
    // Local state for the input text box
    const [inputValue, setInputValue] = useState<string>('');

    // Accessing the context to get the setBOTIframe function
    const { setBOTIframe } = useID();

    // Handle input change
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value); // Update input value as the user types
    };

    // Handle form submission (on submit button click)
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault(); // Prevent page reload on form submit
        if (inputValue.trim()) {
            setBOTIframe(inputValue); // Pass the input string to setBOTIframe
            setInputValue(''); // Clear the input after submission
        }
    };

    return (
        <div>
            <h1 className="page-title">Configuration Page</h1>
            <form onSubmit={handleSubmit}>
                {/* Input field for semicolon-separated URLs */}
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Enter URLs separated by semicolon"
                />
                {/* Submit button to trigger the setBOTIframe function */}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default Configuration;
