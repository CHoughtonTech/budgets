import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: false,
    headers: {
        Accept: "applicaiton/json",
        "Content-Type" : "application/json"
    }
});

export default {
    getBills() {
        return apiClient.get("/bills");
    },
    updateBill(bill) {
        let billPayload = JSON.stringify(bill);
        return apiClient.put(`/bills/${bill.id}/`, billPayload);
    },
    deleteBill(id) {
        return apiClient.delete(`/bills/${id}`);
    },
    getActiveMonth() {
        return apiClient.get('/activeMonth');
    }
}