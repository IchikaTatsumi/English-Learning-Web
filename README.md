# English-Learning-Web
English vocabulary learning web app with pronunciation practice, spaced repetition, and progress tracking

## 🚀 Các bước Cài đặt và Chạy

Thực hiện các bước sau theo thứ tự từ thư mục gốc của dự án.

### 1. Khởi động Database (PostgreSQL)

Chúng ta sẽ sử dụng Docker Compose để khởi động database PostgreSQL.

1.  Từ thư mục gốc (root) của dự án, chạy lệnh:
    ```bash
    docker-compose up -d postgres
    ```
    Lệnh này sẽ build và chạy service `postgres` trong chế độ nền (detached) dựa trên tệp `docker-compose.yml`.

2.  Bạn cũng có thể sử dụng script có sẵn trong `backend` bằng cách `cd backend` và chạy:
    ```bash
    npm run docker:db:start
    ```
   

---

### 2. Cài đặt và Chạy Speech Service (Python)

Backend cần service này để xử lý tác vụ liên quan đến giọng nói.

1.  Mở một terminal mới, di chuyển vào thư mục `speech`:
    ```bash
    cd speech
    ```

2.  (Khuyến nghị) Tạo và kích hoạt môi trường ảo (virtual environment):
    ```bash
    # Trên macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    
    # Trên Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  Cài đặt các thư viện Python cần thiết:
    ```bash
    pip install -r requirements.txt
    ```
   

4.  Khởi động service:
    ```bash
    python main.py
    ```
    Service sẽ chạy trên `http://localhost:5000`.

---

### 3. Cài đặt và Chạy Backend (NestJS)

1.  Mở một terminal mới, di chuyển vào thư mục `backend`:
    ```bash
    cd backend
    ```

2.  Cài đặt các dependencies của Node.js:
    ```bash
    npm install
    ```

3.  Tạo tệp môi trường `.env`:
    * Copy tệp `backend/.env.example` và đổi tên thành `.env`.
    * **QUAN TRỌNG:** Cập nhật các biến môi trường trong tệp `.env` để khớp với `docker-compose.yml`.

    ```dotenv
    # Database - Phải khớp với docker-compose.yml
    POSTGRES_HOST=localhost
    POSTGRES_PORT=5432
    POSTGRES_USER=dbuser
    POSTGRES_PASSWORD=dbpassword
    POSTGRES_DB=mydatabase
    
    # JWT
    JWT_SECRET=your-super-secret-jwt-key-change-in-production
    
    # Server
    PORT=3001
    FRONTEND_URL=http://localhost:3000
    
    # Python Speech Server (đã chạy ở bước 2)
    PYTHON_SPEECH_SERVER_URL=http://localhost:5000
    
    # Các biến khác
    AUDIO_UPLOAD_PATH=./uploads/audio
    SAVE_TTS_AUDIO=true
    VOSK_MODEL_PATH=./vosk-model-small-en-us-0.15
    ```

4.  Khởi động backend ở chế độ development:
    ```bash
    npm run start:dev
    ```
   
    Backend sẽ chạy trên `http://localhost:3001` (hoặc `PORT` bạn đã định nghĩa).

---

### 4. Cài đặt và Chạy Frontend (Next.js)

1.  Mở một terminal mới, di chuyển vào thư mục `frontend`:
    ```bash
    cd frontend
    ```

2.  Cài đặt các dependencies của Node.js:
    ```bash
    npm install
    ```

3.  Tạo tệp môi trường `.env.local`:
    * Copy tệp `frontend/.env.example` và đổi tên thành `.env.local`.
    * Cập nhật tệp `.env.local` để trỏ đến địa chỉ backend (đã chạy ở bước 3).

    ```dotenv
    # Phải trỏ đến địa chỉ và port của Backend (ví dụ: 3001)
    NEXT_PUBLIC_API_ENDPOINT=http://localhost:3001/api
    
    API_KEY=your-api-key-here
    ```
    *(Lưu ý: Chúng tôi đã điều chỉnh `NEXT_PUBLIC_API_ENDPOINT` thành `http://localhost:3001/api` để khớp với port `3001` của backend, thay vì `4000` như trong tệp ví dụ)*

4.  Khởi động frontend:
    ```bash
    npm run dev
    ```
   
    Frontend sẽ chạy trên `http://localhost:3000`.

---

## ✅ Tóm tắt

Sau khi hoàn tất các bước trên, bạn sẽ có các dịch vụ sau đang chạy:

* **Frontend:** `http://localhost:3000` (Next.js)
* **Backend:** `http://localhost:3001` (NestJS)
* **Speech Service:** `http://localhost:5000` (Python FastAPI)
* **Database:** `localhost:5432` (PostgreSQL trên Docker)

Bây giờ bạn có thể truy cập `http://localhost:3000` trên trình duyệt để sử dụng ứng dụng.