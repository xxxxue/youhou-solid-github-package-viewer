import { Component, createSignal, For, Match, Show, Switch } from "solid-js";
import cssModule from "./index.module.css";
import {
  Button,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  createDisclosure,
} from "@hope-ui/solid";
import { createQuery } from "@tanstack/solid-query";

interface IPackageJson {
  dependencies: { [key: string]: string };
  devDependencies: { [key: string]: string };
}
interface IPkg {
  name: string;
  version: string;
}

interface IQueryObj {
  dep: IPkg[];
  devDep: IPkg[];
}

const App: Component = () => {
  const { isOpen, onOpen, onClose } = createDisclosure();

  const [repoName, setRepoName] = createSignal<string>();

  let query = createQuery<IQueryObj, Error>(
    () => ["packageData"],
    async () => {
      try {
        // github 文件有 5 分钟的 disk cache
        let filePath = `https://raw.githubusercontent.com/${repoName()}/main/package.json`;
        let apiResult: IPackageJson = await fetch(filePath).then((r) => {
          if (r.status == 200) {
            return r.json();
          }
          throw new Error("发生异常,状态码:" + r.status);
        });

        if (apiResult != undefined) {
          console.log("来数据了");

          // 运行时依赖
          let depList = apiResult.dependencies;
          let depArr: IPkg[] = [];
          for (const key in depList) {
            if (Object.prototype.hasOwnProperty.call(depList, key)) {
              const value = depList[key];
              depArr.push({ name: key, version: value });
            }
          }

          // 开发依赖
          let devDepArr: IPkg[] = [];
          let devDepList = apiResult.devDependencies;

          for (const key in devDepList) {
            if (Object.prototype.hasOwnProperty.call(devDepList, key)) {
              const value = devDepList[key];
              devDepArr.push({ name: key, version: value });
            }
          }
          let ret: IQueryObj = { dep: depArr, devDep: devDepArr };
          return ret;
        }
        throw new Error("无数据");
      } catch (error) {
        throw error;
      }
    },
    {
      get enabled() {
        let name = repoName();
        return name != undefined && name != "";
      },
      retry: 2,
    }
  );

  let fetchPackageJson = () => {
    let sel = document.querySelector<HTMLAnchorElement>(
      "#repository-container-header > div.d-flex.flex-wrap.flex-justify-end.mb-3.px-3.px-md-4.px-lg-5 > div > div > strong > a"
    );

    let name = sel?.href!;
    if (name == undefined) {
      return;
    }

    console.log(name);
    name = name.replaceAll("https://github.com", "");

    setRepoName(name);
  };

  let openDrawer = () => {
    isOpen() ? onClose() : onOpen();
    fetchPackageJson();
  };

  return (
    <div>
      <Button class={cssModule.myButton} css={{ position: "fixed" }} onClick={openDrawer}>
        查看项目依赖
      </Button>
      <Drawer opened={isOpen()} placement="top" size="lg" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>查看项目依赖</DrawerHeader>

          <DrawerBody>
            <div style={{ display: "flex", "justify-content": "center" }}>
              <Switch>
                <Match when={query.isLoading}>
                  <div>loading...</div>
                </Match>
                <Match when={query.isError}>
                  <div>Error: {query!.error!.message}</div>
                </Match>
                <Match when={query.isSuccess}>
                  <Show when={query.data?.dep?.length ?? 0 > 0}>
                    <div>
                      <h1>dependencies</h1>
                      <Table>
                        <Thead>
                          <Tr>
                            <Th>名称</Th>
                            <Th>版本</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          <For each={query.data?.dep}>
                            {(item) => {
                              return (
                                <Tr>
                                  <Td>{item.name}</Td>
                                  <Td>{item.version}</Td>
                                </Tr>
                              );
                            }}
                          </For>
                        </Tbody>
                      </Table>
                    </div>
                  </Show>
                  <Show when={query.data?.devDep?.length ?? 0 > 0}>
                    <div>
                      <h1>devDependencies</h1>

                      <Table>
                        <Thead>
                          <Tr>
                            <Th>名称</Th>
                            <Th>版本</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          <For each={query.data?.devDep}>
                            {(item) => {
                              return (
                                <Tr>
                                  <Td>{item.name}</Td>
                                  <Td>{item.version}</Td>
                                </Tr>
                              );
                            }}
                          </For>
                        </Tbody>
                      </Table>
                    </div>
                  </Show>
                </Match>
              </Switch>
            </div>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr="$3" onClick={onClose}>
              关闭
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default App;
