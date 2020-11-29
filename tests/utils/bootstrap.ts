import "reflect-metadata";
import { loadContainer } from "../../src/ioc/ioc";
import {Container} from "inversify";

const testContainer = loadContainer(false);

export function getTestContainer(): Container {
  return testContainer;
}
