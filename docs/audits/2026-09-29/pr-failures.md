# Recent agent PR failures

Investigated 29 September 2026 against develop commit `1cba603`.

Three failed CI runs on recent accessibility/ramp PRs failed at the same
development-login assertion after passing the earlier quality checks:

| PR  | Failed run                                                                      | Observed failure                                                                   |
| --- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| #53 | [36534101838](https://github.com/holtsdav/RoomPlanner/actions/runs/36534101838) | Wrong password returned HTTP 500 instead of 401                                    |
| #53 | [36535997820](https://github.com/holtsdav/RoomPlanner/actions/runs/36535997820) | Same assertion                                                                     |
| #56 | [36544593062](https://github.com/holtsdav/RoomPlanner/actions/runs/36544593062) | Same assertion; Wrangler ProxyWorker explicitly reported “Network connection lost” |

The last failure identifies a local Wrangler/Miniflare transport error. It does
not establish a ramp rendering bug or prove the underlying transport cause.
The first two logs do not include enough response detail to prove the same
transport cause. This is a bounded review of recent failures, not a claim that
all historical agent PR failures share one cause.

PR #56 subsequently added bounded retries for the specific HTTP 500 / “Network
connection lost” signature. Its next CI run,
[36546262624](https://github.com/holtsdav/RoomPlanner/actions/runs/36546262624),
passed. The current development login gate also passed during this investigation
locally, including CSRF, session, asset protection, and throttling assertions.
The precise runtime fault remains unproven; more retries or weaker authentication
assertions are not justified by this evidence.

A process gap made these failures surprising: CONTRIBUTING required only
`npm run check`, which runs formatting, lint, TypeScript, unit tests, and a build.
CI additionally exercises the development server in browsers, both compiled
Workers, their authentication and browser flows, and the production dependency
audit. CONTRIBUTING now lists the complete pre-PR sequence.

The original local release attempt in this investigation passed authentication
but could not launch the missing Playwright Chromium build. The browser download
timed out; the installed Chromium can be used through the project's existing
`PLAYWRIGHT_EXECUTABLE_PATH` support. These environment failures must be reported
as such, rather than described as passing application tests.
