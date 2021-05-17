import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: false,
    headers: {
        Accept: "application/json",
        "Content-Type" : "application/json"
    }
});

export default {
    getBills() {
        return apiClient.get("/bills");
    },
    getBillById(id) {
        return apiClient.get(`/bills/${id}`);
    },
    createBill(bill) {
        let billPayload = JSON.stringify(bill);
        return apiClient.post("/bills", billPayload);
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
    },
    updateActiveMonth(month) {
        let monthPayload = JSON.stringify(month);
        return apiClient.put(`/activeMonth`, monthPayload);
    }
}