export type CreateProcessRequest = {
    process: Process
}

export type CreateProcessResponse = {
    id: string
}

export type GetProcessStatusRequest = {
    id: string
}

export type GetProcessStatusResponse = {
    status: Status
}

export type GetProcessOutputRequest = {
    id: string
}

export type GetProcessOutputResponse = {
    output: Output
}

export type Process = {
    mode: Mode,
    language: Language,
    input: Input
}

export type Input = {
    readonly source: string
}

export type Output = {
    readonly source: string
}

export enum Mode {
    CODE = "CODE",
    DOCUMENT = "DOCUMENT",
    UNIT_TEST = "UNIT_TEST",
    MIGRATE_SYNTAX = "MIGRATE_SYNTAX",
    REFACTOR_NAMING = "REFACTOR_NAMING",
}

export enum Language {
    JAVA = "JAVA"
}

export enum Status {
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    TIMED_OUT = "TIMED_OUT"
}