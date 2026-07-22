"use client";

import "@mantine/core/styles.css";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MantineProvider,
  createTheme,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Text,
  Box,
} from "@mantine/core";

const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
});

const schema = z.object({
  accountNumber: z
    .string()
    .min(1, "Account Number is required")
    .regex(/^\d+$/, "Invalid Account Number. Please try again."),
  pin: z
    .string()
    .min(1, "Security PIN is required")
    .regex(/^\d+$/, "Invalid Security PIN. Please try again."),
});

const steps = [
  { label: "Account\nActivation", active: true },
  { label: "SMS\nVerification", active: false },
  { label: "Group\nAccount", active: false },
  { label: "Key\nGeneration", active: false },
];

function IconPlaceholder() {
  return (
    <Box
      style={{
        width: 32,
        height: 24,
        background: "linear-gradient(135deg, #d1d5db 0%, #e5e7eb 50%, #9ca3af 100%)",
        borderRadius: 4,
        flexShrink: 0,
      }}
    />
  );
}

function EyeIcon({ crossed }) {
  if (crossed) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function Stepper() {
  return (
    <Box my={36}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 24,
            right: 24,
            height: 2,
            backgroundColor: "#d1d5db",
            zIndex: 0,
          }}
        />
        {steps.map((step, idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, flex: 1 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: step.active ? "none" : "2px solid #374151",
                backgroundColor: step.active ? "#1e40af" : "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              {step.active && (
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#fff" }} />
              )}
            </div>
            <Text size="sm" fw={step.active ? 700 : 500} ta="center" style={{ whiteSpace: "pre-line", lineHeight: 1.3 }}>
              {step.label}
            </Text>
          </div>
        ))}
      </div>
    </Box>
  );
}

function TitleSection() {
  return (
    <Box>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Box
          style={{
            width: 130,
            height: 52,
            background: "linear-gradient(135deg, #94a3b8 0%, #cbd5e1 50%, #64748b 100%)",
            borderRadius: 6,
            opacity: 0.75,
          }}
        />
        <Text size={52} fw={700} c="#1e3a8a" lh={1} style={{ margin: 0 }}>
          API
        </Text>
      </div>
      <Text size={28} fw={700} c="#1e3a8a" mt={12} style={{ lineHeight: 1.2 }}>
        Group Account Activation
      </Text>
      <Text size="lg" c="#111827" mt={12} style={{ lineHeight: 1.6 }}>
        Lorem ipsum dolor sit amet, adipiscing elit. Nullam sollicitudin orci vel diam pellentesque aliquet.
      </Text>
    </Box>
  );
}

function AccountActivationForm({ onNext }) {
  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      accountNumber: "",
      pin: "",
    },
  });

  const accountNumberValue = watch("accountNumber");
  const pinValue = watch("pin");

  const isAccountValid = accountNumberValue.length > 0 && /^\d+$/.test(accountNumberValue);
  const isPinValid = pinValue.length > 0 && /^\d+$/.test(pinValue);
  const canSubmit = isAccountValid && isPinValid;

  const handleKeyDown = (e) => {
    if (
      !/[0-9]/.test(e.key) &&
      !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End", "Enter"].includes(e.key) &&
      !(e.metaKey || e.ctrlKey)
    ) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    if (/^\d+$/.test(pastedText)) {
      const input = e.target;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const currentValue = input.value;
      const newValue = currentValue.slice(0, start) + pastedText + currentValue.slice(end);
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeInputValueSetter.call(input, newValue);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  const onSubmit = (data) => {
    onNext(data);
  };

  const accountError = touchedFields.accountNumber
    ? errors.accountNumber?.message
    : null;
  const pinError = touchedFields.pin ? errors.pin?.message : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack gap="lg">
        <TitleSection />

        <Stepper />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Text size="xl" fw={700} c="#1e3a8a" style={{ lineHeight: 1.2 }}>
            Login{" "}
            <Box component="span" style={{ opacity: 0.45 }}>
              [Account]
            </Box>{" "}
            Account
          </Text>
        </div>

        <Controller
          name="accountNumber"
          control={control}
          render={({ field }) => (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <IconPlaceholder />
                <Text size="lg" fw={500} style={{ lineHeight: 1 }}>
                  Account Number
                </Text>
              </div>
              <TextInput
                {...field}
                placeholder="12345678"
                size="xl"
                radius="md"
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                error={accountError}
                styles={{
                  input: {
                    fontSize: 20,
                    padding: "14px 16px",
                    borderColor: accountError ? "#dc2626" : "#9ca3af",
                    borderWidth: accountError ? 2 : 1,
                    "&:focus": {
                      borderColor: accountError ? "#dc2626" : "#1e40af",
                    },
                    "&::placeholder": {
                      color: "#9ca3af",
                    },
                  },
                  error: {
                    color: "#dc2626",
                    fontSize: 14,
                    marginTop: 6,
                  },
                }}
                inputMode="numeric"
                type="text"
                label={undefined}
              />
            </div>
          )}
        />

        <Controller
          name="pin"
          control={control}
          render={({ field }) => (
            <div>
              <div style={{ marginBottom: 8 }}>
                <Text size="lg" fw={500} style={{ lineHeight: 1 }}>
                  Security PIN
                </Text>
              </div>
              <PasswordInput
                {...field}
                placeholder="12345678"
                size="xl"
                radius="md"
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                error={pinError}
                visibilityToggleIcon={({ reveal }) => <EyeIcon crossed={reveal} />}
                styles={{
                  input: {
                    fontSize: 20,
                    padding: "14px 16px",
                    borderColor: pinError ? "#dc2626" : "#9ca3af",
                    borderWidth: pinError ? 2 : 1,
                    "&:focus": {
                      borderColor: pinError ? "#dc2626" : "#1e40af",
                    },
                    "&::placeholder": {
                      color: "#9ca3af",
                    },
                  },
                  innerInput: {
                    fontSize: 20,
                  },
                  error: {
                    color: "#dc2626",
                    fontSize: 14,
                    marginTop: 6,
                  },
                  visibilityToggle: {
                    color: "#6b7280",
                  },
                }}
                inputMode="numeric"
                label={undefined}
              />
            </div>
          )}
        />

        <Button
          type="submit"
          fullWidth
          size="xl"
          radius="xl"
          disabled={!canSubmit}
          mt="md"
          styles={{
            root: {
              backgroundColor: canSubmit ? "#1e40af" : "#b0b0b0",
              color: "#fff",
              fontSize: 22,
              fontWeight: 500,
              padding: "14px 0",
              transition: "background-color 0.2s ease",
              "&:hover": {
                backgroundColor: canSubmit ? "#1e3a8a" : "#b0b0b0",
              },
              "&:not(:disabled):active": {
                backgroundColor: canSubmit ? "#172554" : "#b0b0b0",
              },
              "&[data-disabled]": {
                backgroundColor: "#b0b0b0",
                color: "#fff",
                opacity: 1,
              },
            },
          }}
        >
          Next
        </Button>

        <Text size="md" c="#6b7280" mt={4}>
          support helpdesk contact information
        </Text>
      </Stack>
    </form>
  );
}

export default function GroupActivationPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(null);

  const handleNext = (data) => {
    setFormData(data);
    setStep(2);
  };

  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <div style={{ height: "100vh", overflowY: "auto", backgroundColor: "#d1d5db" }}>
        <div style={{ minHeight: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 16px" }}>
          <Paper
            shadow="xl"
            p={48}
            radius="lg"
            style={{ maxWidth: 680, width: "100%", backgroundColor: "#fff" }}
          >
          {step === 1 && <AccountActivationForm onNext={handleNext} />}
          {step === 2 && (
            <Stack align="center" gap="md" py={60}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 32,
                }}
              >
                ✓
              </div>
              <Text size="xl" fw={700} c="#1e3a8a">
                Step 1 Complete
              </Text>
              {formData && (
                <Box style={{ background: "#f5f5f5", padding: 16, borderRadius: 8, width: "100%" }}>
                  <pre style={{ margin: 0, fontSize: 14 }}>
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </Box>
              )}
              <Button
                variant="subtle"
                color="gray"
                onClick={() => {
                  setStep(1);
                  setFormData(null);
                }}
              >
                Back to Step 1
              </Button>
            </Stack>
          )}
        </Paper>
        </div>
      </div>
    </MantineProvider>
  );
}
