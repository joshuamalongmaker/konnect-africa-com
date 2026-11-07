Konnect Africa is a platform dedicated to connecting communities, fostering collaboration, and driving social impact across Africa.  
This repository contains the source code and assets for the official **Konnect Africa** website.

## 🌍 Overview

The Konnect Africa website serves as a digital hub to showcase our mission, projects, and initiatives. It provides visitors with an easy-to-navigate interface to learn about our work, access resources, and get involved in our activities.

## ✨ Features

- **Responsive Design** – Optimized for desktop, tablet, and mobile devices.
- **Modern UI/UX** – Clean and engaging interface for a smooth user experience.
- **Project Showcase** – Highlight ongoing and completed community projects.
- **Contact & Feedback** – Easy ways for visitors to reach out and share ideas.
- **News & Updates** – Section for important announcements and events.

## 🛠️ Tech Stack

- **HTML5** – Structure and content.
- **CSS3** – Styling and layout.
- **JavaScript (Vanilla)** – Interactivity and dynamic content.
- **[Optional] Bootstrap / TailwindCSS** – For responsive design (if applicable).
- **Hosting** – [GitHub Pages / Custom Hosting Provider] *(Specify actual hosting platform)*.

## 📂 Project Structure

konnect-africa-website/
│
├── index.html        # Homepage
├── about.html        # About Us page
├── projects.html     # Projects listing
├── contact.html      # Contact page
│
├── css/
│   └── style.css     # Main stylesheet
│
├── js/
│   └── script.js     # Main JavaScript file
│
├── images/           # Image assets
└── README.md         # Project documentation


## 🚀 Getting Started

### Prerequisites
- Web browser (Chrome, Firefox, Edge, Safari)
- Basic understanding of HTML, CSS, and JavaScript

### Installation
1. Clone the repository:
   git clone https://github.com/<your-username>/konnect-africa-website.git

2. Install dependencies and start the application server:

   npm install
   npm start

   Open `http://localhost:3000` to use the site. The News & Insights feed combines recent headlines from GDELT, development reports from the World Bank Documents & Reports API, and academic publication metadata from Crossref. Vercel deployments use `api/news.js` for the `/api/news` endpoint, which caches results for an hour and can return results when an individual source is unavailable. Other static-only hosts need a separately deployed API server. Keep `.env` and `credentials.json` out of public deployments.

   For production, set `JWT_SECRET` to a cryptographically random value of at least 32 bytes and configure `MONGODB_URI` before starting the server. Generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. The server refuses to start in production without a sufficiently strong secret; local development uses a temporary secret that invalidates tokens when the server restarts.
3. Start editing and customizing as needed.

## 📌 Usage

* Visit the live site: **[Konnect Africa Website](https://konnectafrica.info)**
* Navigate through the menu to explore pages and features.
* Use the contact form to send inquiries.

## 🤝 Contributing

We welcome contributions!
If you’d like to improve the website or add new features:

1. Fork this repository.
2. Create a new branch:

   git checkout -b feature/your-feature
  
3. Commit your changes and push:
   git commit -m "Add your feature"
   git push origin feature/your-feature
   ```
4. Open a pull request.

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For questions, suggestions, or collaborations:
**Email:** [info@konnectafrica.org](mailto:info@konnectafrica.info)
**Website:** [www.konnectafrica.org](http://www.konnectafrica.info)
**Location:** Juba, South Sudan
