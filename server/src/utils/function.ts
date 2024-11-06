const bcrypt = require("bcrypt");

const saltRounds = 10;
export const hashPassword = async (password) => {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
};

export const checkPassword = async (password, hash) => {
    const match = await bcrypt.compare(password, hash);
    return match;
};

export const generateConfirmationToken = async (email) => {
    const hash = await bcrypt.hash(email, saltRounds);
    return hash;
};

export const formatDate = async (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0"); // hónap 0-tól kezdődik
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
