export interface JobsEntry {
    name: string;
    cancelCallback?: () => void;
    progressPct?: number;
    statusMessage?: string;
}
export interface JobsListModel {
    id: number;
    type: 'JobsListWidget';
    jobs: JobsEntry[];
    finished: JobsEntry[];
    queued: JobsEntry[];
    aborted: JobsEntry[];
    addJob(job: JobsEntry): void;
    removeJob(jobName: string): void;
    addFinishedJob(job: JobsEntry): void;
    addQueuedJob(job: JobsEntry): void;
    addAbortedJob(job: JobsEntry): void;
    removeQueuedJob(jobName: string): void;
    updateJobStatusMessage(jobName: string, message?: string): void;
    updateJobProgressPct(jobName: string, pct: number): void;
}
export declare const ApolloJobModel: import("@jbrowse/mobx-state-tree").IModelType<{}, {
    readonly jobStatusWidget: JobsListModel;
} & {
    /**
     * updates the status message and the progress percent of the provided job
     * @param jobName - the name of the job to be updated
     * @param statusMessage - the message to be communicated to the user
     * @param progressPct - the percent through the run the job is
     */
    update(jobName: string, statusMessage: string, progressPct?: number): void;
    /**
     * aborts the provided job with a message to the user
     * @param jobName - the name of the job to be aborted
     * @param msg - a message to communicate to the user about the abort operation
     */
    abortJob(jobName: string, msg?: string): void;
    /**
     * opens the job status widget and adds the job to the running jobs
     * @param job - the job to be run within the JobsManager
     */
    runJob(job: JobsEntry): void;
    /**
     * sets the progress and status message of the provided job
     * adds the finished jobs to the list of finished jobs
     * clears the jobs manager of the now done job
     * begins to run the next job if one is queued
     * @param job - the job to be completed
     */
    done(job: JobsEntry): void;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
//# sourceMappingURL=ApolloJobModel.d.ts.map