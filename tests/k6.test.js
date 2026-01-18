const http = require("k6/http");
const { sleep, check } = require("k6");

// Test configuration
export const options = {
    stages: [
        { duration: "30s", target: 50 }, // Ramp up to 50 users over 30s
        { duration: "1m", target: 50 }, // Stay at 50 users for 1 min
        { duration: "30s", target: 1000 }, // Ramp up to 100 users
        { duration: "2m", target: 700 }, // Stay at 100 users
        { duration: "30s", target: 0 }, // Ramp down
    ],
    thresholds: {
        http_req_duration: ["p(95)<500"], // 95% of requests should be below 500ms
        http_req_failed: ["rate<0.01"], // Error rate should be less than 1%
    },
};

export default function () {
    const payload = JSON.stringify({
        email: "don@gmail.com",
        password: "don@123",
    });

    const params = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = http.post(
        "http://localhost:3612/api/auth/login",
        payload,
        params,
    );

    check(res, {
        "status is 200": (r) => r.status === 200,
    });

    sleep(1);
}
