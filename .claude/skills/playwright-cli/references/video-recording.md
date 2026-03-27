# Video Recording

Capture browser automation sessions as video for debugging, documentation, or verification. Produces WebM (VP8/VP9 codec).

## Basic Recording

```bash
playwright-cli video-start
playwright-cli open https://localhost:5173
playwright-cli snapshot
playwright-cli click e1
playwright-cli fill e2 "test input"
playwright-cli video-stop demo.webm
```

## Best Practices

- Use descriptive filenames: `recordings/checkout-flow.webm`
- Recording adds slight overhead to automation
- Large recordings consume significant disk space
