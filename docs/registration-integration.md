# Registration integration v0.3.1

All URLs remain blank and flags false. Owner-only Apps Script export is installed separately. It uses existing form item mapping to generate programme-only prefill links, not guessed entry IDs. Do not publish real forms until privacy and intake tests pass. Verify each generated link opens the correct programme and no prefilled personal/consent data. Returning form stays generic to avoid confusing phone-update and course requests. Class choice not passed to backend yet.

## Pure function checks
- PASS: prefill valid
- PASS: no selection fallback
- PASS: other service unchanged
- PASS: disabled global
- PASS: unknown code fallback
- PASS: other origin
- PASS: other form
- PASS: extra entry
- PASS: other course
- PASS: unknown query
- PASS: bad encoding
- PASS: fragment
- PASS: duplicate usp

No browser/live Forms test performed.
