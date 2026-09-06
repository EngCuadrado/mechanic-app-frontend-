import { Toaster } from "sonner";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client/react";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";

import "./index.css";
import "./utils/dateUtils";
import App from "./App.tsx";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";

import { setContext } from "@apollo/client/link/context";

const baseUrl = import.meta.env.VITE_BASE_API_URL;

const authLink = setContext((_, { headers }) => {
	return {
		headers: {
			...headers,
			"apollo-require-preflight": "true",
			"graphql-preflight": "1", // Para asegurar compatibilidad con HotChocolate
		}
	}
});

const uploadLink = new UploadHttpLink({ uri: baseUrl + "graphql/" });

const client = new ApolloClient({
	link: authLink.concat(uploadLink),

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
