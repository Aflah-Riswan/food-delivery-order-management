# Food Delivery Order Management System — Requirements

## Menu
- Display food name, description, price, and image.
- Retrieve menu items through the backend API.

## Cart
- Add and remove food items.
- Update item quantities.
- Calculate the total.

## Checkout
- Collect customer name, delivery address, and phone number.
- Validate the submitted details.
- Create orders through the REST API.

## Order Management
- Create, retrieve, update, and delete orders according to defined business rules.
- Store ordered item snapshots, quantities, delivery details, total, status, and creation time.
- Calculate prices using trusted backend menu data.
- Validate allowed order status transitions.

## Order Tracking
- Display the current order status.
- Simulate status changes in the backend.
- Use Server-Sent Events (SSE) for real-time updates if feasible.

## Testing
- Follow strict TDD.
- Test menu retrieval, order CRUD, validation, pricing, and status transitions.
- Test key React components and user interactions.

## Constraints
- Use in-memory storage; data is lost on server restart.
- No authentication or online payment integration in the initial version.
- Keep the implementation simple enough to demonstrate MVC and SOLID clearly.