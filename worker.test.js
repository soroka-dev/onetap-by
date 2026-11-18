import test from "node:test";
import assert from "node:assert/strict";
import { validateLead } from "./worker.js";

test("accepts a complete lead", () => {
  const result = validateLead({
    telegram: "@onetap_client",
    phone: "+375 29 123-45-67",
    service: "reviews",
    quantity: "около 100",
    comment: "Круглые чёрные",
  });
  assert.equal(result.ok, true);
});

test("requires Telegram, phone, service and quantity", () => {
  assert.equal(validateLead({}).ok, false);
  assert.equal(validateLead({ telegram: "@valid_user" }).ok, false);
  assert.equal(validateLead({ telegram: "@valid_user", phone: "+375291234567" }).ok, false);
  assert.equal(validateLead({ telegram: "@valid_user", phone: "+375291234567", service: "wifi" }).ok, false);
});

test("rejects an unknown service", () => {
  const result = validateLead({
    telegram: "@valid_user",
    phone: "+375291234567",
    service: "unknown",
    quantity: "50",
  });
  assert.equal(result.ok, false);
});
