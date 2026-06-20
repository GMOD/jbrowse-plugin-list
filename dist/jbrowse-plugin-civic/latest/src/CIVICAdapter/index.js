import {
  ConfigurationSchema,
  readConfObject,
} from "@jbrowse/core/configuration";
import { ObservableCreate } from "@jbrowse/core/util/rxjs";
import { BaseFeatureDataAdapter } from "@jbrowse/core/data_adapters/BaseAdapter";
import SimpleFeature from "@jbrowse/core/util/simpleFeature";

export const configSchema = ConfigurationSchema(
  "CIVICAdapter",
  {
    base: {
      type: "string",
      description: "URL for the CIVIC API",
      defaultValue: "",
    },
  },
  { explicitlyTyped: true },
);

export class AdapterClass extends BaseFeatureDataAdapter {
  async fetchFeatures() {
    const str = readConfObject(this.config, "base");
    const result = await fetch(str);
    if (!result.ok) {
      throw new Error(`Failed to fetch ${result.status} ${result.statusText}`);
    }
    return result.json();
  }

  setup() {
    if (!this.setupP) {
      this.setupP = this.fetchFeatures();
    }
    return this.setupP;
  }

  formatFeature(data) {
    const { coordinates, id, description, ...rest } = data;
    const { start, stop, chromosome } = coordinates;

    if (start - 1 < stop) {
      return new SimpleFeature({
        ...rest,
        coordinates,
        id:
          '<a href="https://civicdb.org/variants/' +
          id +
          '/summary">CIVIC DB - ' +
          id +
          "</a>",
        start: start - 1,
        end: stop,
        refName: chromosome,
        uniqueId: id,
        ...(description && { description }),
      });
    } else {
      console.warn("Feature with start>end", data);
      return undefined;
    }
  }

  getFeatures(region) {
    return ObservableCreate(async (observer) => {
      try {
        const data = await this.setup();
        const { refName, start, end } = region;
        data.records
          .map((r) => this.formatFeature(r))
          .filter((f) => !!f)
          .filter(
            (f) =>
              f.get("refName") === refName &&
              f.get("end") >= start &&
              f.get("start") <= end,
          )
          .forEach((f) => {
            observer.next(f);
          });
        observer.complete();
      } catch (e) {
        observer.error(e);
      }
    });
  }

  async getRefNames() {
    const arr = [];
    for (let i = 0; i < 23; i++) {
      arr.push(`${i}`);
    }
    return arr;
  }

  freeResources() {}
}
