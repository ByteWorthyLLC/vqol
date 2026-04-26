# Aggregate Submission

VQOL is local-first by default. Aggregate submission is an explicit opt-in for
practices that want de-identified longitudinal score events for quality
improvement or research operations.

Default config:

```json
{
  "features": {
    "aggregateSubmit": false,
    "aggregateEndpoint": null
  }
}
```

Enabled config:

```json
{
  "practiceId": "example-vein-center",
  "features": {
    "aggregateSubmit": true,
    "aggregateEndpoint": "https://collector.example/vqol"
  }
}
```

Submitted payload:

```json
{
  "schemaVersion": 1,
  "practiceId": "example-vein-center",
  "sessionId": "browser-generated-session-id",
  "calculatedAt": 1771939200000,
  "scores": {
    "qolTscore": 47.2,
    "symTscore": 45.8
  }
}
```

The payload excludes questionnaire answers, names, dates of birth, contact
details, IP-handling policy, and appointment metadata. The receiving practice is
responsible for endpoint hosting, retention, access control, privacy policy,
and any required BAA or institutional review process.

Implementation entry points:

- Client submitter: `src/lib/aggregate/submit.ts`
- Example receiver: `examples/aggregate-receiver/worker.js`
- Config validation: `src/lib/practice-config/validate.ts`
