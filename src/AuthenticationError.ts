class AuthenticationError extends Error {

    constructor(msg: string) {
        super(msg);
    }
}

export default AuthenticationError;