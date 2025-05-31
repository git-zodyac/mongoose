import { describe, expect, it } from "@jest/globals";
import { z } from "zod";
import { zodSchema } from "./index";
import mongoose from "mongoose";

describe("Optional nested objects with required fields", () => {
	const NestedSchema = z.object({
		requiredField: z.string(),
		anotherRequired: z.string(),
	});

	const MainSchema = z.object({
		name: z.string(),
		optionalNested: NestedSchema.optional(),
	});

	const TestModel = mongoose.model("OptionalNestedTest", zodSchema(MainSchema));

	it("should allow creation without optional nested object", async () => {
		const doc = {
			name: "Test Document",
			// optionalNested is not provided
		};

		// This should not throw validation errors
		const created = new TestModel(doc);
		const validationResult = created.validateSync();
		
		expect(validationResult).toBeUndefined(); // No validation errors
	});

	it("should allow creation with optional nested object provided", async () => {
		const doc = {
			name: "Test Document",
			optionalNested: {
				requiredField: "value1",
				anotherRequired: "value2",
			},
		};

		const created = new TestModel(doc);
		const validationResult = created.validateSync();
		
		expect(validationResult).toBeUndefined(); // No validation errors
	});

	it("should fail validation if optional nested object is provided but incomplete", async () => {
		const doc = {
			name: "Test Document",
			optionalNested: {
				requiredField: "value1",
				// anotherRequired is missing
			},
		};

		const created = new TestModel(doc);
		const validationResult = created.validateSync();
		
		expect(validationResult).toBeDefined(); // Should have validation errors
		expect(validationResult?.errors["optionalNested.anotherRequired"]).toBeDefined();
	});
});