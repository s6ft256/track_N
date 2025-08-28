export class ValidationService {
    constructor() {
        this.rules = {
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            password: {
                required: true,
                minLength: 6,
                message: 'Password must be at least 6 characters long'
            },
            name: {
                required: true,
                minLength: 2,
                message: 'Name must be at least 2 characters long'
            },
            assessorId: {
                required: true,
                pattern: /^[A-Z0-9-]+$/,
                message: 'Assessor ID must contain only uppercase letters, numbers, and hyphens'
            },
            location: {
                required: true,
                minLength: 3,
                message: 'Location must be at least 3 characters long'
            },
            observation: {
                required: true,
                minLength: 10,
                message: 'Observation must be at least 10 characters long'
            },
            riskLevel: {
                required: true,
                options: ['High', 'Medium', 'Low'],
                message: 'Please select a valid risk level'
            }
        };
    }

    validateField(fieldName, value) {
        const rule = this.rules[fieldName];
        if (!rule) return { isValid: true };

        const errors = [];

        // Required validation
        if (rule.required && (!value || value.toString().trim() === '')) {
            errors.push(`${this.getFieldLabel(fieldName)} is required`);
            return { isValid: false, errors };
        }

        // Skip other validations if field is empty and not required
        if (!value || value.toString().trim() === '') {
            return { isValid: true };
        }

        // Pattern validation
        if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(rule.message);
        }

        // Min length validation
        if (rule.minLength && value.length < rule.minLength) {
            errors.push(rule.message);
        }

        // Options validation
        if (rule.options && !rule.options.includes(value)) {
            errors.push(rule.message);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateForm(formData, fieldNames) {
        const results = {};
        let isFormValid = true;

        fieldNames.forEach(fieldName => {
            const result = this.validateField(fieldName, formData[fieldName]);
            results[fieldName] = result;
            if (!result.isValid) {
                isFormValid = false;
            }
        });

        return {
            isValid: isFormValid,
            fields: results
        };
    }

    getFieldLabel(fieldName) {
        const labels = {
            email: 'Email',
            password: 'Password',
            name: 'Name',
            assessorId: 'Assessor ID',
            location: 'Location',
            observation: 'Observation',
            riskLevel: 'Risk Level'
        };
        return labels[fieldName] || fieldName;
    }

    // Real-time validation for form inputs
    setupRealTimeValidation(formElement, fieldNames) {
        fieldNames.forEach(fieldName => {
            const input = formElement.querySelector(`[name="${fieldName}"]`);
            if (input) {
                input.addEventListener('blur', () => {
                    this.validateAndShowErrors(input, fieldName);
                });

                input.addEventListener('input', () => {
                    // Clear errors on input
                    this.clearFieldErrors(input);
                });
            }
        });
    }

    validateAndShowErrors(input, fieldName) {
        const result = this.validateField(fieldName, input.value);
        
        if (!result.isValid) {
            this.showFieldErrors(input, result.errors);
            input.classList.add('border-red-500');
            input.classList.remove('border-green-500');
        } else {
            this.clearFieldErrors(input);
            input.classList.add('border-green-500');
            input.classList.remove('border-red-500');
        }

        return result.isValid;
    }

    showFieldErrors(input, errors) {
        this.clearFieldErrors(input);
        
        const errorContainer = document.createElement('div');
        errorContainer.className = 'field-errors text-red-500 text-sm mt-1';
        
        errors.forEach(error => {
            const errorElement = document.createElement('div');
            errorElement.textContent = error;
            errorContainer.appendChild(errorElement);
        });

        input.parentNode.appendChild(errorContainer);
    }

    clearFieldErrors(input) {
        const existingErrors = input.parentNode.querySelector('.field-errors');
        if (existingErrors) {
            existingErrors.remove();
        }
        input.classList.remove('border-red-500', 'border-green-500');
    }
}