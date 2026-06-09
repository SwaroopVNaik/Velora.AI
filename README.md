# Velora.AI

### AI-Powered Website Builder

<p align="center">
  Transform a natural-language idea into a responsive website, refine it through AI chat, preview the result, and manage every project from one workspace.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite 7">
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" alt="Node.js and Express">
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB and Mongoose">
  <img src="https://img.shields.io/badge/Firebase-Authentication-FFCA28?logo=firebase&logoColor=black" alt="Firebase Authentication">
  <img src="https://img.shields.io/badge/AI-OpenRouter-7C3AED" alt="OpenRouter AI">
</p>

---

## 📖 Overview

Velora.AI is a full-stack AI website builder that converts natural-language
prompts into complete, responsive HTML websites. It provides a guided workflow
for users who want to create polished web experiences without manually writing
every part of the page.

The platform solves the gap between an idea and a usable first implementation.
A user describes the website they need, and Velora.AI sends a carefully
structured design brief to an AI model through OpenRouter. The backend validates
the generated response, stores the website and its conversation history in
MongoDB, and presents the result inside a sandboxed live preview.

Users can continue refining the same project through prompt-based editing. Each
change request includes the current website document so the AI can preserve the
existing design while applying targeted updates.

> [!NOTE]
> The payment workflow is intentionally a mock gateway for demonstration and
> educational use. It does not collect card details or process real money.

## ✨ Key Features

| Feature | Description |
| --- | --- |
| 🤖 AI website generation | Generates a complete HTML5 document with embedded CSS and JavaScript from a natural-language prompt. |
| 💬 Prompt-based editing | Applies requested changes to an existing website while preserving unrelated design and functionality. |
| 📱 Responsive output | Requires viewport support, media queries, touch-friendly controls, and mobile navigation behavior. |
| 👁️ Live preview | Renders generated websites in a sandboxed iframe directly inside the editor. |
| 🧑‍💻 Monaco code view | Allows users to inspect and experiment with the generated HTML in a professional code editor. |
| 📂 Project management | Lists projects in a dashboard with edit, preview, deploy, copy-link, and delete actions. |
| 🔐 Google authentication | Uses Firebase Google sign-in and exchanges verified Firebase identity tokens for secure application sessions. |
| 🔄 Website regeneration | Supports continuous AI-assisted iterations through a stored user/AI conversation history. |
| 🪙 Credit system | Atomically reserves credits for generation and editing, then refunds them when an AI operation fails. |
| 💳 Subscription plans | Includes Free, Pro, and Enterprise plans with plan-specific credit allocations. |
| 🧾 Mock payment gateway | Simulates successful and failed payments without integrating a real payment processor. |
| 📊 Transaction tracking | Stores unique transaction IDs, plans, amounts, statuses, owners, and timestamps in MongoDB. |
| 🔗 Shareable site routes | Publishes generated projects to a public slug-based route within the application. |
| 🎨 Modern interface | Uses Tailwind CSS, Motion animations, responsive layouts, and Lucide icons. |

## ⚙️ How It Works

1. **Authentication**
   - The user signs in with Google through Firebase Authentication.
   - The client sends the Firebase ID token to the backend.
   - The server verifies the token using Google's remote JSON Web Key Set.
   - Velora.AI creates or updates the MongoDB user and returns a signed JWT in
     an HTTP-only cookie.

2. **Prompt submission**
   - The user enters a website description on the generation page.
   - The protected generation API validates the prompt and atomically reserves
     50 credits.

3. **AI planning and generation**
   - The backend first attempts to create a concise design blueprint.
   - The final generation prompt combines the user brief, design requirements,
     accessibility rules, responsive behavior, and verified image guidance.
   - OpenRouter selects from configured models and allows provider fallback.

4. **Response validation**
   - The server extracts the JSON response and checks for a complete HTML
     document, viewport metadata, embedded styles, media queries, closing tags,
     and prompt-specific quality requirements.
   - Invalid or incomplete output receives one corrective retry.

5. **Persistence and preview**
   - The website code, title, owner, timestamps, and conversation are stored in
     MongoDB.
   - The client opens the project in the editor and renders it in a sandboxed
     iframe.

6. **AI editing**
   - The user describes a change in the editor chat.
   - The current full HTML document and requested modification are sent to the
     AI.
   - Velora.AI uses a size-aware output budget, validates the complete updated
     document, saves it, and refreshes the live preview.

7. **Project management**
   - Saved websites appear on the dashboard.
   - Users can reopen, deploy, share, or delete projects that they own.

### Subscription Plans

| Plan | Demonstration price | Credits | Behavior |
| --- | ---: | ---: | --- |
| Free | ₹0 | 100 initial credits | Assigned to new users |
| Pro | ₹499 one-time | +500 credits | Activates the Pro plan after a successful mock transaction |
| Enterprise | ₹1,499 one-time | +1,000 credits | Activates the Enterprise plan after a successful mock transaction |

## 🧰 Technology Stack

### Frontend

| Technology | Responsibility |
| --- | --- |
| React 19 | Component-based user interface |
| Vite 7 | Development server and production bundling |
| Tailwind CSS 4 | Utility-first styling and responsive design |
| Redux Toolkit | Centralized authentication and user-credit state |
| React Router | Public, protected, editor, pricing, and live-site routes |
| Motion | Page transitions and interface animations |
| Lucide React | Consistent interface iconography |
| Axios | Credential-aware API communication |
| Firebase Web SDK | Google authentication |
| Monaco Editor | Generated HTML inspection and editing interface |

### Backend

| Technology | Responsibility |
| --- | --- |
| Node.js | Server runtime |
| Express 5 | REST API and middleware pipeline |
| Mongoose | MongoDB schemas, validation, indexes, and transactions |
| JSON Web Token | Seven-day application sessions |
| JOSE | Firebase ID-token verification through remote JWKs |
| Helmet | Secure HTTP response headers |
| CORS | Explicit frontend origin allowlist |
| Express Rate Limit | Global and route-specific request throttling |
| Cookie Parser | HTTP-only session-cookie access |

### Data and External Services

| Service | Responsibility |
| --- | --- |
| MongoDB | Users, websites, conversations, subscriptions, and transactions |
| Firebase Authentication | Google identity provider |
| OpenRouter | AI model routing and fallback for generation and editing |
| Unsplash | Curated remote imagery for relevant generated designs |

## 🏗️ System Architecture

```mermaid
flowchart LR
    U[User Browser] --> C[React + Vite Client]
    C --> F[Firebase Google Authentication]
    F -->|Firebase ID token| A[Express Authentication API]
    A -->|HTTP-only JWT cookie| C
    C -->|Credentialed REST requests| API[Node.js + Express API]
    API --> AUTH[Authentication Middleware]
    AUTH --> WC[Website Controller]
    AUTH --> PC[Payment Controller]
    AUTH --> UC[User Controller]
    WC --> OR[OpenRouter AI Models]
    WC --> DB[(MongoDB)]
    PC --> DB
    UC --> DB
    C --> PREVIEW[Sandboxed Website Preview]
```

### Frontend Layer

The React client owns page routing, authentication state, forms, dashboards,
AI progress feedback, live previews, payment simulations, and transaction
history. Protected routes wait for session restoration before rendering.

### Backend Layer

The Express API validates requests, verifies authentication, enforces resource
ownership, reserves credits, coordinates AI requests, processes mock payment
states, and returns structured JSON responses.

### Database Layer

MongoDB stores three primary entities:

- **User**: Firebase UID, name, email, avatar, credits, and subscription plan.
- **Website**: owner, title, generated code, AI conversation, deployment state,
  public URL, and slug.
- **Transaction**: unique transaction ID, user, plan, amount, status, and
  timestamps.

Indexes support recent-project queries, transaction history, unique users,
unique transaction IDs, and unique deployment slugs.

### AI Processing Layer

The OpenRouter integration supports configurable model selection and fallback.
The generation controller builds specialized prompts, optionally creates a
design blueprint, parses JSON output, validates complete HTML, retries invalid
responses, and protects user credits when generation fails.

## 📁 Project Structure

```text
AIwebsiteBuilder/
├── README.md
├── client/
│   ├── public/                    # Static frontend assets
│   ├── src/
│   │   ├── assets/               # Client-side images and static imports
│   │   ├── components/
│   │   │   ├── LoginModal.jsx    # Firebase Google sign-in modal
│   │   │   └── PaymentModal.jsx  # Mock success/failure checkout UI
│   │   ├── hooks/
│   │   │   └── useGetCurrentUser.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page
│   │   │   ├── Dashboard.jsx     # Project management
│   │   │   ├── Generate.jsx      # Initial AI website generation
│   │   │   ├── Editor.jsx        # AI chat, preview, and Monaco editor
│   │   │   ├── LiveSite.jsx      # Public generated-site renderer
│   │   │   ├── Pricing.jsx       # Plans and mock checkout entry
│   │   │   └── PaymentHistory.jsx
│   │   ├── redux/
│   │   │   ├── store.js          # Redux store configuration
│   │   │   └── userSlice.js      # User, plan, credits, and auth state
│   │   ├── App.jsx               # Lazy routes and route protection
│   │   ├── config.js             # Backend URL configuration
│   │   ├── firebase.js           # Firebase client initialization
│   │   ├── index.css             # Global Tailwind styles
│   │   └── main.jsx              # React entry point
│   ├── index.html
│   ├── eslint.config.js
│   ├── vercel.json               # SPA rewrite configuration
│   ├── vite.config.js
│   └── package.json
└── server/
    ├── config/
    │   ├── db.js                 # MongoDB connection
    │   ├── env.js                # Environment loading
    │   ├── firebaseAuth.js       # Firebase token verification
    │   ├── openRouter.js         # AI request and model fallback client
    │   └── plan.js               # Plan prices and credit allocations
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── payment.controller.js
    │   ├── user.controllers.js
    │   └── website.controllers.js
    ├── middlewares/
    │   └── isAuth.js             # Required and optional JWT authentication
    ├── models/
    │   ├── transaction.model.js
    │   ├── user.model.js
    │   └── website.model.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── payment.routes.js
    │   ├── user.routes.js
    │   └── website.routes.js
    ├── utils/
    │   └── extractJson.js        # Defensive AI JSON extraction
    ├── index.js                  # Express application entry point
    └── package.json
```

## 🚀 Installation and Setup

### Prerequisites

- Node.js and npm
- A MongoDB database
- MongoDB Atlas or a local replica set for transaction-backed payment upgrades
- A Firebase project with Google Authentication enabled
- An OpenRouter API key

### 1. Clone the repository

```bash
git clone <repository-url>
cd AIwebsiteBuilder
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

### 4. Configure Firebase

1. Create or select a Firebase project.
2. Open **Authentication → Sign-in method**.
3. Enable the **Google** provider.
4. Add `localhost` and the production frontend domain to Firebase
   Authentication's authorized domains.
5. Add the Firebase web configuration values to `client/.env`.
6. Use the same Firebase project ID in `server/.env`.

### 5. Configure environment variables

Create `client/.env` and `server/.env` using the examples below. Do not commit
real secrets to source control.

### 6. Start the backend

```bash
cd server
npm run dev
```

With the sample configuration, the API runs at
`http://localhost:8000`.

### 7. Start the frontend

Open another terminal:

```bash
cd client
npm run dev
```

The Vite application runs at `http://localhost:5173`.

### 8. Production checks

```bash
cd client
npm run lint
npm run build
```

Start the production backend with:

```bash
cd server
npm start
```

## 🔑 Environment Variables

### Client: `client/.env`

```env
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Server: `server/.env`

```env
PORT=8000
NODE_ENV=development

FRONTEND_URL=http://localhost:5173
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/velora_ai
JWT_SECRET=replace_with_a_long_random_secret_of_at_least_32_characters

FIREBASE_PROJECT_ID=your-project-id
OPENROUTER_API_KEY=your_openrouter_api_key

# Optional: comma-separated model preference order.
OPENROUTER_MODELS=qwen/qwen3-coder:free,qwen/qwen3-next-80b-a3b-instruct:free,openai/gpt-oss-120b:free

# Required in production only when the demonstration gateway should be enabled.
MOCK_PAYMENTS_ENABLED=true
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Recommended | Base URL used by the React client for API calls |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project identifier used by the client |
| `PORT` | No | Express port; defaults to `5000` when omitted |
| `NODE_ENV` | Recommended | Enables production cookie and proxy behavior |
| `FRONTEND_URL` | Yes in production | Comma-separated CORS allowlist and public-site base URL |
| `MONGODB_URL` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Signs application session tokens; must be at least 32 characters in production |
| `FIREBASE_PROJECT_ID` | Recommended | Firebase token issuer and audience validation |
| `OPENROUTER_API_KEY` | Yes | Authorizes AI requests |
| `OPENROUTER_MODELS` | No | Overrides the default comma-separated model fallback list |
| `OPENROUTER_MODEL` | No | Single-model alternative to `OPENROUTER_MODELS` |
| `MOCK_PAYMENTS_ENABLED` | Production only | Explicitly enables mock-payment endpoints in production |

> [!IMPORTANT]
> `VITE_*` variables are included in the frontend bundle and must never contain
> private server secrets. Keep MongoDB, JWT, and OpenRouter credentials only in
> `server/.env`.

> [!TIP]
> The successful-payment endpoint uses a MongoDB transaction to update the user
> and transaction together. MongoDB Atlas supports this directly; a local
> MongoDB installation must run as a replica set for this flow.

## 🔌 API Overview

All protected requests use the `token` HTTP-only cookie and must include
credentials. The examples below assume the base URL
`http://localhost:8000`.

### Authentication APIs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/google` | Public | Verifies a Firebase ID token, creates or updates the user, and starts a JWT cookie session |
| `POST` | `/api/auth/logout` | Public | Clears the application session cookie |
| `GET` | `/api/user/me` | Optional auth | Restores the current user when a valid cookie exists |

### Website and Project APIs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/website/generate` | Protected | Generates and stores a website; costs 50 credits |
| `POST` | `/api/website/update/:id` | Protected owner | Applies an AI change to a website; costs 25 credits |
| `GET` | `/api/website/get-by-id/:id` | Protected owner | Returns one website and its conversation |
| `GET` | `/api/website/get-all` | Protected | Returns the current user's projects |
| `DELETE` | `/api/website/delete/:id` | Protected owner | Permanently deletes a project |
| `POST` | `/api/website/deploy/:id` | Protected owner | Creates a public slug and marks a project as deployed |
| `GET` | `/api/website/get-by-slug/:slug` | Public | Returns a deployed website for the live-site route |

### Mock Payment APIs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/payment/create` | Protected | Creates a pending Pro or Enterprise transaction |
| `POST` | `/api/payment/success` | Protected owner | Marks a pending transaction successful and atomically applies plan credits |
| `POST` | `/api/payment/failure` | Protected owner | Marks a pending transaction failed |
| `GET` | `/api/payment/history` | Protected | Returns the user's successful and failed transactions |

The payment routes are automatically available in development. In production,
they return `503 Service Unavailable` unless
`MOCK_PAYMENTS_ENABLED=true`.

## 🧭 User Workflow

1. Visit the Velora.AI landing page.
2. Sign in with a verified Google account.
3. Open the dashboard or start a new website.
4. Enter a detailed prompt describing the website, audience, style, sections,
   colors, and interactions.
5. Wait while Velora.AI plans, generates, validates, and stores the website.
6. Review the generated result in the live preview.
7. Use the editor chat to request text, color, layout, section, animation, or
   functionality changes.
8. Inspect the complete HTML through the Monaco code panel.
9. Return to the dashboard to manage all saved projects.
10. Deploy a project to generate a shareable in-application URL.
11. Purchase demonstration credits through the mock payment modal when needed.
12. Review successful and failed mock transactions on the payment-history page.

## 📸 Screenshots

Replace the following paths with captured application screenshots:

### Landing Page

![Velora.AI Landing Page](docs/screenshots/landing-page.png)

### Dashboard

![Velora.AI Dashboard](docs/screenshots/dashboard.png)

### AI Generation

![Velora.AI Generation Page](docs/screenshots/ai-generation.png)

### Website Preview and Editor

![Velora.AI Website Editor](docs/screenshots/website-preview.png)

### Pricing Page

![Velora.AI Pricing Page](docs/screenshots/pricing-page.png)

### Mock Payment Page

![Velora.AI Mock Payment](docs/screenshots/payment-page.png)

## 🛡️ Security Features

- **Verified identity exchange**: Firebase ID tokens are verified using Google's
  remote signing keys, RS256, issuer, and audience checks.
- **HTTP-only sessions**: The application JWT is inaccessible to browser
  JavaScript and expires after seven days.
- **Production cookie controls**: Cookies use `Secure` and `SameSite=None` in
  production for HTTPS cross-origin deployments.
- **Protected routes**: Website, generation, editing, deployment, deletion, and
  payment actions require authenticated users.
- **Ownership enforcement**: Website and transaction queries include the
  authenticated user's MongoDB ID.
- **CORS allowlist**: Only configured frontend origins can make credentialed
  browser requests.
- **Origin validation**: State-changing requests from unapproved origins are
  rejected.
- **Security headers**: Helmet configures defensive HTTP headers and disables
  the Express signature.
- **Rate limiting**: Global, authentication, AI generation, and payment limits
  reduce brute-force attempts and resource abuse.
- **Input limits**: JSON bodies are limited to 1 MB, prompts to 4,000
  characters, and generated code to schema-controlled limits.
- **Schema validation**: Mongoose validates emails, plans, transaction states,
  amounts, message roles, and field lengths.
- **Atomic operations**: Credit reservations and successful mock-payment plan
  upgrades use atomic database operations; payment upgrades use a MongoDB
  transaction.
- **Sandboxed previews**: Generated websites run in iframes restricted to
  `allow-scripts`, without same-origin access.
- **Fail-fast configuration**: The server refuses to start without MongoDB,
  JWT, and OpenRouter credentials.

## ⚡ Performance Optimizations

- React pages are loaded with `lazy()` and `Suspense` to reduce the initial
  bundle workload.
- Redux Toolkit keeps shared user, authentication, plan, and credit state
  centralized.
- Dashboard queries use field selection, lean MongoDB documents, sorting, and
  compound indexes.
- Generated website previews use object URLs and revoke old URLs during React
  effect cleanup.
- AI edits use a size-aware output budget based on the existing document,
  reducing unnecessary output while retaining room for complete HTML.
- OpenRouter supports an ordered model list and provider fallback instead of
  depending on one model endpoint.
- AI responses are validated before database writes, with only one corrective
  retry for incomplete output.
- Credits are reserved atomically before expensive AI operations, preventing
  concurrent overspending.
- Route-specific rate limits protect expensive generation and payment
  workflows.
- Vite performs production bundling, tree-shaking, minification, and asset
  optimization.

## 🗺️ Future Roadmap

- [ ] Integrate a real payment gateway with verified provider webhooks
- [ ] Publish generated projects to external static hosting providers
- [ ] Support custom domains and automated SSL configuration
- [ ] Add downloadable HTML/CSS/JavaScript export packages
- [ ] Introduce reusable starter templates and a template marketplace
- [ ] Add team workspaces, project roles, and real-time collaboration
- [ ] Provide version history, checkpoints, and one-click rollback
- [ ] Add automated accessibility, performance, and SEO reports
- [ ] Support asset uploads and managed media libraries
- [ ] Add automated frontend, backend, and end-to-end test suites
- [ ] Provide usage analytics and generation-cost reporting

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a focused branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Install dependencies in both `client` and `server`.
4. Keep changes scoped and follow the existing project structure.
5. Run frontend validation:

   ```bash
   cd client
   npm run lint
   npm run build
   ```

6. Verify edited backend files with Node.js syntax checks when applicable:

   ```bash
   node --check server/controllers/website.controllers.js
   ```

7. Commit the change with a clear message.
8. Push the branch and open a pull request describing the behavior, validation,
   and any configuration changes.

Please do not commit `.env` files, API keys, database credentials, generated
build output, or unrelated formatting changes.

## 📄 License

The server package metadata currently declares the **ISC License**. Before
redistributing the complete repository, add a root `LICENSE` file containing
the selected license terms so the licensing scope is explicit for both the
frontend and backend.

## ✅ Conclusion

Velora.AI combines prompt-driven generation, iterative AI editing, secure
authentication, project persistence, credit management, mock subscriptions,
transaction history, live previews, and public project routes in one full-stack
application.

Its layered React, Express, MongoDB, Firebase, and OpenRouter architecture keeps
the user interface, API logic, data models, authentication, AI processing, and
payment simulation clearly separated while supporting the complete journey
from an initial idea to a managed and shareable website.
"# Velora.AI" 
