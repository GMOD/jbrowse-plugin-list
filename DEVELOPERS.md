## Development guide

This repo uploads plugin code to our jbrowse.org s3 bucket

We used to use unpkg.org as a CDN but it was a bit unrelaible at times

We now synchronize our CDN from NPM daily at midnight using a github action

It makes a PR and then you have to manually upload the results to s3 with

```bash
yarn upload
```
