const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/jobs` : "http://backend:8080/api/jobs";

export { API_URL };
