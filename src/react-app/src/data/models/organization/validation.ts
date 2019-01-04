import { UIError, UIErrorType, ValidationState, ValidationErrorType } from "../../../types";

export default class Validation {
    static nonPrintableRe = /[\000-\031]/

    static testNonPrintableCharacters(s: string) {
        const firstNonPrintable = s.search(Validation.nonPrintableRe)
        if (firstNonPrintable === -1) {
            return false
        }
        const beforeStart = firstNonPrintable - 5 < 0 ? 0 : firstNonPrintable - 5
        const before = s.slice(beforeStart, firstNonPrintable)
        const after = s.slice(firstNonPrintable + 1, firstNonPrintable + 6)
        return `Non-printable character at position ${firstNonPrintable}: "${before}___${after}`
    }
    static validateOrgId(id: string): [string, ValidationState] {
        // May not be empty
        if (id.length === 0) {
            return [
                id, {
                    type: ValidationErrorType.REQUIRED_MISSING,
                    message: 'Organization id may not be empty',
                    validatedAt: new Date()
                }]
        }
        // No spaces
        if (id.match(/\s/)) {
            return [
                id, {
                    type: ValidationErrorType.ERROR,
                    message: 'Organization id may not contain a space',
                    validatedAt: new Date()
                }]
        }
        // May not exceed maximum size
        // todo: what is the real limit?
        if (id.length > 100) {
            return [
                id, {
                    type: ValidationErrorType.ERROR,
                    message: 'Organization id may not be longer than 100 characters',
                    validatedAt: new Date()
                }]
        }

        // May only consist if lower case alphanumeric
        const alphaRe = /^[a-z0-9-]+$/
        if (!id.match(alphaRe)) {
            return [
                id, {
                    type: ValidationErrorType.ERROR,
                    message: 'Organization ID may only contain lower case letters (a-z), numeric digits (0-9) and the dash "-"',
                    validatedAt: new Date()
                }
            ]
        }

        return [id, {
            type: ValidationErrorType.OK,
            validatedAt: new Date()
        }]
    }

    static validateOrgName(name: string): [string, ValidationState] {
        if (name.length === 0) {
            return [
                name, {
                    type: ValidationErrorType.REQUIRED_MISSING,
                    message: 'Organization name may not be empty',
                    validatedAt: new Date()
                }]
        }
        if (name.length > 256) {
            return [
                name, {
                    type: ValidationErrorType.ERROR,
                    message: 'Organization name may not be longer than 256 characters',
                    validatedAt: new Date()
                }]
        }
        return [
            name, {
                type: ValidationErrorType.OK,
                validatedAt: new Date()
            }]
    }

    static validateOrgGravatarHash(gravatarHash: string | null): [string | null, ValidationState] {
        if (!gravatarHash) {
            return [
                null, {
                    type: ValidationErrorType.OK,
                    validatedAt: new Date()
                }]
        }
        if (gravatarHash.length === 0) {
            return [
                gravatarHash, {
                    type: ValidationErrorType.OK,
                    validatedAt: new Date()
                }]
        }
        if (gravatarHash.length > 32) {
            return [
                gravatarHash, {
                    type: ValidationErrorType.ERROR,
                    message: 'Organization gravatar hash may not be longer than 32 characters',
                    validatedAt: new Date()
                }]
        }
        if (gravatarHash.length < 32) {
            return [
                gravatarHash, {
                    type: ValidationErrorType.ERROR,
                    message: 'Organization gravatar hash may not be shorter than 32 characters',
                    validatedAt: new Date()
                }]
        }
        const acceptedChars = /^[a-f0-9]+$/
        if (!acceptedChars.test(gravatarHash)) {
            return [
                gravatarHash, {
                    type: ValidationErrorType.ERROR,
                    message: 'Organization gravatar hash must consist only of the lower case hexadecimal characters a-f and 0-9',
                    validatedAt: new Date()
                }
            ]
        }

        return [
            gravatarHash, {
                type: ValidationErrorType.OK,
                validatedAt: new Date()
            }]
    }

    static validateOrgDescription(description: string): [string, ValidationState] {
        if (description.length === 0) {
            // return [name, {
            //     type: ValidationErrorType.OK,
            //     validatedAt: new Date()
            // }]
            return [name, {
                type: ValidationErrorType.ERROR,
                message: 'Organization description may not be empty',
                validatedAt: new Date()
            }]
        }
        // TODO: Is there really a limit?
        // const nonPrintable = Validation.testNonPrintableCharacters(description)
        // if (nonPrintable) {
        //     return [
        //         description, {
        //             type: UIErrorType.ERROR,
        //             message: nonPrintable
        //         }
        //     ]
        // }
        if (description.length > 4096) {
            return [
                description, {
                    type: ValidationErrorType.ERROR,
                    message: 'Organization description may not be longer than 4,096 characters',
                    validatedAt: new Date()
                }]
        }
        return [
            description, {
                type: ValidationErrorType.OK,
                validatedAt: new Date()
            }
        ]
    }
}