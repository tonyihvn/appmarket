# MySQL Migration Guide - Updating Controllers

## Completed Migrations ✅
- ✅ `authController.ts` - Updated to Sequelize
- ✅ `favoriteController.ts` - Updated to Sequelize
- ✅ `appRequestController.ts` - Updated to Sequelize
- ✅ Database setup with Sequelize

## Remaining Controllers to Update

### Key Changes Summary

**From MongoDB/Mongoose:** → **To MySQL/Sequelize**
```
User.findOne({ email })      → User.findOne({ where: { email } })
User.findById(id)             → User.findByPk(id)
User.create(data)             → User.create(data)
await user.save()             → await user.save()
User.find({ field: value })   → User.findAll({ where: { field: value } })
document._id                  → document.id
(req as any).userId           → (req as any).user?.id
.select('+password')          → Not needed (all fields included by default)
.populate('fieldName')        → include: [{ model: RelatedModel }]
.countDocuments()             → Model.count()
.findByIdAndDelete(id)        → Model.destroy({ where: { id } })
skip/limit                    → offset/limit
```

### Template for Updating Controllers

```typescript
// BEFORE (Mongoose)
import Model from '../models/Model';
const doc = await Model.findById(id);
const docs = await Model.find({ field: value }).skip(skip).limit(limit);
const count = await Model.countDocuments({ field: value });
await Model.findByIdAndDelete(id);

// AFTER (Sequelize)
import Model from '../models/Model.sequelize';
const doc = await Model.findByPk(id);
const { count, rows } = await Model.findAndCountAll({
  where: { field: value },
  offset,
  limit,
});
const count = await Model.count({ where: { field: value } });
await Model.destroy({ where: { id } });
```

## Controllers Still Needing Migration

### 1. `appController.ts`
**Location:** `src/controllers/appController.ts`
**Key Changes:**
- Replace `App.findById()` with `App.findByPk()`
- Replace `App.find()` with `App.findAll()`
- Update category relationships: `.category` ID → foreign key lookups
- Replace `.populate('userId')` with `include: [{ model: User }]`
- Replace `.skip(skip).limit(limit)` with `offset, limit`

**Model References:** User, App, Category

### 2. `reviewController.ts`
**Location:** `src/controllers/reviewController.ts`
**Key Changes:**
- Replace Review.findById/findOne with Sequelize equivalents
- Include App and User relationships via `include`
- Replace mongoDB text search with Sequelize search patterns
- Update rating calculations

**Model References:** Review, User, App

### 3. `userController.ts`
**Location:** `src/controllers/userController.ts`
**Key Changes:**
- Replace User.findOne with User.findOne({ where: {} })
- Update profile updates: use `.update()` instead of direct assignment
- Replace `.select('+password')` with field selection via attributes
- Replace `_id` references with `id`

**Model References:** User, Company, Freelancer

### 4. `categoryController.ts`
**Location:** `src/controllers/categoryController.ts`
**Key Changes:**
- Replace `Category.findById()` with `Category.findByPk()`
- Replace `.populate()` with include relationships
- Update app count calculations using Sequelize count

**Model References:** Category, App

### 5. `bidController.ts`
**Location:** `src/controllers/bidController.ts`
**Key Changes:**
- Replace Bid.findById/find with Sequelize methods
- Update ProjectRequest relationships
- Replace user ID references

**Model References:** Bid, ProjectRequest, User

### 6. `projectController.ts`
**Location:** `src/controllers/projectController.ts`
**Key Changes:**
- Replace ProjectRequest operations with Sequelize
- Update bid count calculations
- Replace pagination (skip/limit) with (offset/limit)

**Model References:** ProjectRequest, Bid, Category, User

### 7. `serviceController.ts`
**Location:** `src/controllers/serviceController.ts`
**Key Changes:**
- Replace Service CRUD operations
- Update user relationships

**Model References:** Service, User

## Authentication Middleware Updates

### File: `src/middleware/auth.ts`

The `protect` middleware already exists and should work with Sequelize.

**Key Update Needed:**
```typescript
// Change from:
req.userId = decoded.id;

// To:
req.user = decoded; // Contains { id, email }
```

Then in controllers use: `(req as any).user?.id` instead of `(req as any).userId`

## Database Connection

Already updated in `src/config/sequelize.ts` with MySQL connection settings from `.env`:
- `DB_HOST` - MySQL host (default: localhost)
- `DB_USER` - MySQL username (default: root)
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name (default: appshub)
- `DB_PORT` - MySQL port (default: 3306)

## Running the Migration

1. **Ensure MySQL is Running**
   ```
   MySQL service should be running on localhost:3306
   ```

2. **Update .env file** (already configured)
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=appshub
   DB_PORT=3306
   ```

3. **Start Backend**
   ```
   cd backend
   npm run dev
   ```
   
   The server will automatically:
   - Connect to MySQL
   - Create all tables if they don't exist
   - Apply any pending migrations

4. **Verify Tables Created**
   ```
   MySQL CLI: mysql -u root appshub
   SHOW TABLES;
   ```

## Testing Endpoints After Migration

All endpoints should work exactly the same from frontend's perspective:
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/apps` - Get all apps
- POST `/api/favorites` - Add favorite
- POST `/api/app-requests` - Create app request
- etc.

## Troubleshooting

### "Cannot find module './models/Model.sequelize'"
→ Ensure all model files end with `.sequelize.ts`

### "TypeError: Router.use() requires a middleware function"
→ Check routes are using correct middleware imports (should use `protect` not `authenticate`)

### "Model not found" errors
→ Ensure models are imported in `src/server.ts` before routes load

### Foreign key constraint errors
→ Ensure relationships are correctly defined in models with proper include statements

## Notes

- All numeric IDs are now auto-incrementing integers (not MongoDB ObjectIds)
- JSON fields use `DataTypes.JSON` for arrays/objects
- Timestamps are handled automatically by Sequelize
- Password hashing is done via Sequelize hooks before create
- All models use plural table names (users, apps, reviews, etc.)
