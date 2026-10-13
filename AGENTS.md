# Food Delivery Order Management System

## Project Goal
Build a food delivery application where users browse food, manage a cart, place orders, and track order status.

## Technology Stack
- Frontend: React, Vite, TypeScript
- Backend: Node.js, Express, TypeScript
- Storage: In-memory
- Testing: Vitest, Supertest, React Testing Library
- Version control: Git

## Architecture
- Use MVC architecture for the backend.
- Separate routes, controllers, services, repositories, and models.
- Keep business logic inside services, not controllers.
- Keep data access inside repositories.
- Inject dependencies where appropriate.
- Keep the frontend separate from backend implementation details.

## SOLID Principles
- Single Responsibility: each module has one clear responsibility.
- Open/Closed: extend behavior without unnecessarily modifying existing code.
- Liskov Substitution: implementations must honor their contracts.
- Interface Segregation: keep interfaces focused.
- Dependency Inversion: business logic should depend on abstractions rather than concrete storage implementations.
- Avoid unnecessary abstractions and overengineering.

## TypeScript Rules
- Enable strict type checking.
- Avoid using `any` unless justified.
- Define types for domain entities, API requests, and responses.
- Use interfaces for repository contracts where appropriate.
- Validate incoming HTTP data at runtime; TypeScript types alone are insufficient.
- Use consistent naming and clear module boundaries.

## Strict TDD
1. Write a test before implementing each new behavior.
2. Run the test and verify it fails for the expected reason.
3. Implement the minimum code required to pass.
4. Run the test again and verify it passes.
5. Refactor only after tests pass.
6. Run relevant tests after refactoring.
7. Never weaken or remove a test simply to make it pass.

## Git Workflow
- Keep main stable.
- Create feature branches for meaningful tasks.
- Follow Conventional Commits.
- Review changes using git diff before committing.
- Run relevant tests before committing implementation changes.
- Push changes to the remote repository (`git push`) properly after each implementation and update.
- Never commit secrets, environment files, dependencies, or build output.
- Never force push, reset, or rewrite shared commits without appropriate approval.
- Report the branch, changes, test results, and commit hash accurately.

## In-Memory Storage
- Store menu items and orders in dedicated modules.
- Document that data is lost when the server restarts.
- Do not claim that in-memory data is permanently persisted.

## Working Procedure
- Read the relevant requirements and inspect existing files before coding.
- Implement one feature at a time.
- Follow the established architecture.
- Explain commands and important decisions.
- Do not claim a test or Git command succeeded unless it was actually executed.