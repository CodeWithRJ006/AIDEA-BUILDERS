# Attendrix – Edge-Integrated Facial Recognition Attendance System

> **Note:** A lightweight, edge-compute facial recognition pipeline for real-time attendance tracking.

## Architecture Overview

```mermaid
flowchart TD
    A["Camera Video Feed"] --> B["Client-Side Frame Capture"]
    B --> C["Face Detection (face-api.js)"]
    C --> D["Feature Extraction & Landmark Descriptor"]
    D --> E["Face Matching Engine (Threshold 0.48)"]
    E --> F["Persistence Layer (Node.js JSON Store)"]
    F --> G["Live Dashboard (HTML/JS)"]
    style A fill:#6C8EBF,stroke:#333,stroke-width:2px
    style B fill:#6CBF8E,stroke:#333,stroke-width:2px
    style C fill:#BF6C6C,stroke:#333,stroke-width:2px
    style D fill:#BF9A6C,stroke:#333,stroke-width:2px
    style E fill:#6C6CBF,stroke:#333,stroke-width:2px
    style F fill:#BF6C9A,stroke:#333,stroke-width:2px
    style G fill:#6CBF9A,stroke:#333,stroke-width:2px
```

## Quickstart

```bash
# Clone and enter directory
git clone https://github.com/CodeWithRJ006/Attendrix.git
cd Attendrix

# Install dependencies
npm install

# Start backend & serve frontend
npm start
```

Open `http://localhost:3000` in your browser.

## Deployment

- **Render** – one-click deploy using `render.yaml` (included).
- **Vercel** – static site with API rewrites using `vercel.json` (included).

---
