export default ({ env }) => ({
    email: {
        config: {
            provider: "nodemailer",
            providerOptions: {
                host: "smtp.gmail.com",
                port: 587,
                auth: {
                    user: "",
                    pass: "",
                },
            },
            settings: {
                defaultFrom: "info@otamoon.hu",
                defaultReplyTo: "info@otamoon.hu",
            },
        },
    },
});
