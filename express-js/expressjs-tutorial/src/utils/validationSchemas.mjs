export const createUserValidationSchema = {
    username: {
        isLength:{
            options: {
                min: 3,
                max: 32
            },
            errorMessage: "Username must be at least 3-15 characters"
        },
        notEmpty: {
            errorMessage: "Username must not be empty"
        },
        isString: {
            errorMessage: "Username must be a string"
        },
    },
    displayName: {
        notEmpty: {
            errorMessage: "Display Name cannot be empty"
        },
        isString: {
            errorMessage: "Display Name must be a string"
        },
    },
    password: {
        notEmpty: true,
    }
}

export const getUsers = {
    filter: {
        isLength:{
            options: {
                min: 3,
                max: 32
            },
            errorMessage: "Must be at least 3-32 characters"
        },
        notEmpty: {
            errorMessage: "Must not be empty"
        },
        isString: {
            errorMessage: "Must be a string"
        },
    },

}