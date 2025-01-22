export const getGenderValue = (genderLabel) => {
    switch (genderLabel) {
        case "Hombre":
            return "male"
        case "Mujer":
            return "female"
        default:
            return undefined;
    }
}
