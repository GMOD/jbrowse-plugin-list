import {
  SimpleFeatureSerialized,
  Feature,
} from '@jbrowse/core/util/simpleFeature'

interface FeatureData {
  [key: string]: unknown
  refName: string
  start: number
  end: number
  type: string
}

export default class ICGCFeature implements Feature {
  private icgcObject: any

  private data: FeatureData

  private uniqueId: string

  private featureType: string

  constructor(args: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icgcObject: any
    id: string
    featureType: string
  }) {
    this.icgcObject = args.icgcObject
    this.featureType = args.featureType ? args.featureType : 'mutation'
    this.data = this.dataFromICGCObject(this.icgcObject, this.featureType)
    this.uniqueId = args.id
  }

  get(field: string) {
    return this.icgcObject[field] || this.data[field]
  }

  set() {}

  parent() {
    return undefined
  }

  children() {
    return undefined
  }

  tags(): string[] {
    const t = [...Object.keys(this.data), ...Object.keys(this.icgcObject)]
    return t
  }

  id(): string {
    return this.uniqueId
  }

  dataFromICGCObject(icgcObject: any, featureType: string): FeatureData {
    // Defaults to mutation values
    const featureData: FeatureData = {
      refName: icgcObject.chromosome,
      type: icgcObject.mutationType,
      start: icgcObject.start - 1,
      end: icgcObject.end,
    }

    if (featureType === 'occurrences') {
      featureData.type = icgcObject.mutationId
      featureData.id = icgcObject.donorId
      featureData.note = icgcObject.mutationId
    }

    return featureData
  }

  toJSON(): SimpleFeatureSerialized {
    return {
      uniqueId: this.uniqueId,
      ...this.data,
      ...this.icgcObject,
    }
  }
}
