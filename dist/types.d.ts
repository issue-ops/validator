export type ValidatorConfig = {
    validators: Validator[];
};
export type Validator = {
    field: string;
    script: string;
};
