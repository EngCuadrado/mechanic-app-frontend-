import { Toaster } from "sonner";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client/react";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

import "./index.css";
import "./utils/dateUtils";
import App from "./App.tsx";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";

const baseUrl = import.meta.env.VITE_BASE_API_URL;

const client = new ApolloClient({
	// link: new HttpLink({ uri: "http://localhost:5036/graphql/" }),
	// link: new HttpLink({ uri: "https://localhost:44361/graphql/" }),
	link: new HttpLink({ uri: baseUrl + "graphql/" }),

	cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")!).render(
	<ApolloProvider client={client}>
		<StrictMode>
			<ThemeProvider>
				<AppWrapper>
					<AuthProvider>
						<Toaster position="top-right" richColors />
						<App />
					</AuthProvider>
				</AppWrapper>
			</ThemeProvider>
		</StrictMode>
	</ApolloProvider>,
);
