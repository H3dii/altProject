export const Fetcher = (Fetcher: any, data: any, action: string, method: string) => {
    const formData = new FormData();
    for (const d of data) {
        formData.append(d.name, d.value);
    }
    Fetcher.submit(formData, { action, method });
};
