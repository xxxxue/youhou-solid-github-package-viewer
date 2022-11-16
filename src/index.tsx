/* @refresh reload */
import { render } from "solid-js/web";
import App from "./components/app";
import { HopeProvider } from "@hope-ui/solid";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

let queryClient = new QueryClient();

render(
  () => (
    // 配置 hope-ui 禁止规范化 css
    <HopeProvider enableCssReset={false}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </HopeProvider>
  ),
  (() => {
    // 给 body 添加一个 div
    let app = document.createElement("div");
    app.id = "my-solid-root"; // 把 Solid 都放入这个 div 中
    document.body.appendChild(app);
    return app;
  })()
);
