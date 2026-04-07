// src/app/enums/permission.enum.ts
export enum Permission {
  // Talent Applications
  VIEW_TALENT = 'view-talent-applications',
  SHOW_TALENT = 'show-talent-applications',
  CREATE_TALENT = 'create-talent-applications',
  EDIT_TALENT = 'edit-talent-applications',
  DELETE_TALENT = 'delete-talent-applications',
  UNDER_REVIEW_TALENT = 'under-review-talent-applications',
  ON_HOLD_TALENT = 'on-hold-talent-applications',
  APPROVE_TALENT = 'approve-talent-applications',
  REJECT_TALENT = 'reject-talent-applications',
  CANCEL_TALENT = 'cancel-talent-applications',
  GENERATE_PDF_TALENT = 'generate-pdf-talent-applications',
  GENERATE_EXCEL_TALENT = 'generate-excel-talent-applications',
  EXPORT_DATA_TALENT = 'export-data-talent-applications',

  // Entrepreneur Applications
  VIEW_ENTREPRENEUR = 'view-entrepreneur-applications',
  SHOW_ENTREPRENEUR = 'show-entrepreneur-applications',
  CREATE_ENTREPRENEUR = 'create-entrepreneur-applications',
  EDIT_ENTREPRENEUR = 'edit-entrepreneur-applications',
  DELETE_ENTREPRENEUR = 'delete-entrepreneur-applications',
  UNDER_REVIEW_ENTREPRENEUR = 'under-review-entrepreneur-applications',
  ON_HOLD_ENTREPRENEUR = 'on-hold-entrepreneur-applications',
  APPROVE_ENTREPRENEUR = 'approve-entrepreneur-applications',
  REJECT_ENTREPRENEUR = 'reject-entrepreneur-applications',
  CANCEL_ENTREPRENEUR = 'cancel-entrepreneur-applications',

  // Investor Applications
  VIEW_INVESTOR = 'view-investor-applications',
  SHOW_INVESTOR = 'show-investor-applications',
  CREATE_INVESTOR = 'create-investor-applications',
  EDIT_INVESTOR = 'edit-investor-applications',
  DELETE_INVESTOR = 'delete-investor-applications',
  UNDER_REVIEW_INVESTOR = 'under-review-investor-applications',
  ON_HOLD_INVESTOR = 'on-hold-investor-applications',
  APPROVE_INVESTOR = 'approve-investor-applications',
  REJECT_INVESTOR = 'reject-investor-applications',
  CANCEL_INVESTOR = 'cancel-investor-applications',

  // Executive Applications
  VIEW_EXECUTIVE = 'view-executive-applications',
  SHOW_EXECUTIVE = 'show-executive-applications',
  CREATE_EXECUTIVE = 'create-executive-applications',
  EDIT_EXECUTIVE = 'edit-executive-applications',
  DELETE_EXECUTIVE = 'delete-executive-applications',
  UNDER_REVIEW_EXECUTIVE = 'under-review-executive-applications',
  ON_HOLD_EXECUTIVE = 'on-hold-executive-applications',
  APPROVE_EXECUTIVE = 'approve-executive-applications',
  REJECT_EXECUTIVE = 'reject-executive-applications',
  CANCEL_EXECUTIVE = 'cancel-executive-applications',

  // Categories
  VIEW_CATEGORIES = 'view-categories',
  SHOW_CATEGORIES = 'show-categories',
  CREATE_CATEGORIES = 'create-categories',
  EDIT_CATEGORIES = 'edit-categories',
  DELETE_CATEGORIES = 'delete-categories',

  // Sub Categories
  VIEW_SUB_CATEGORIES = 'view-sub-categories',
  SHOW_SUB_CATEGORIES = 'show-sub-categories',
  CREATE_SUB_CATEGORIES = 'create-sub-categories',
  EDIT_SUB_CATEGORIES = 'edit-sub-categories',
  DELETE_SUB_CATEGORIES = 'delete-sub-categories',

  // Sectors
  VIEW_SECTORS = 'view-sectors',
  SHOW_SECTORS = 'show-sectors',
  CREATE_SECTORS = 'create-sectors',
  EDIT_SECTORS = 'edit-sectors',
  DELETE_SECTORS = 'delete-sectors',

  // Activities
  VIEW_ACTIVITIES = 'view-activities',
  SHOW_ACTIVITIES = 'show-activities',
  CREATE_ACTIVITIES = 'create-activities',
  EDIT_ACTIVITIES = 'edit-activities',
  DELETE_ACTIVITIES = 'delete-activities',

  // Sub Activities
  VIEW_SUB_ACTIVITIES = 'view-sub-activities',
  SHOW_SUB_ACTIVITIES = 'show-sub-activities',
  CREATE_SUB_ACTIVITIES = 'create-sub-activities',
  EDIT_SUB_ACTIVITIES = 'edit-sub-activities',
  DELETE_SUB_ACTIVITIES = 'delete-sub-activities',

  // Entities
  VIEW_ENTITIES = 'view-entities',
  SHOW_ENTITIES = 'show-entities',
  CREATE_ENTITIES = 'create-entities',
  EDIT_ENTITIES = 'edit-entities',
  DELETE_ENTITIES = 'delete-entities',

  // Incubators
  VIEW_INCUBATORS = 'view-incubators',
  SHOW_INCUBATORS = 'show-incubators',
  CREATE_INCUBATORS = 'create-incubators',
  EDIT_INCUBATORS = 'edit-incubators',
  DELETE_INCUBATORS = 'delete-incubators',

  // Form Fields
  VIEW_FORM_FIELDS = 'view-form-fields',
  SHOW_FORM_FIELDS = 'show-form-fields',
  CREATE_FORM_FIELDS = 'create-form-fields',
  EDIT_FORM_FIELDS = 'edit-form-fields',
  DELETE_FORM_FIELDS = 'delete-form-fields',

  // Stages
  VIEW_STAGES = 'view-stages',
  SHOW_STAGES = 'show-stages',
  CREATE_STAGES = 'create-stages',
  EDIT_STAGES = 'edit-stages',
  DELETE_STAGES = 'delete-stages',

  // Stage Statuses
  VIEW_STAGE_STATUSES = 'view-stage-statuses',
  SHOW_STAGE_STATUSES = 'show-stage-statuses',
  CREATE_STAGE_STATUSES = 'create-stage-statuses',
  EDIT_STAGE_STATUSES = 'edit-stage-statuses',
  DELETE_STAGE_STATUSES = 'delete-stage-statuses',

  // User Management
  VIEW_ADMIN_USERS = 'view-admin-users',
  SHOW_ADMIN_USERS = 'show-admin-users',
  CREATE_ADMIN_USERS = 'create-admin-users',
  EDIT_ADMIN_USERS = 'edit-admin-users',
  DELETE_ADMIN_USERS = 'delete-admin-users',

  VIEW_APPLICANT_USERS = 'view-applicant-users',
  SHOW_APPLICANT_USERS = 'show-applicant-users',
  CREATE_APPLICANT_USERS = 'create-applicant-users',
  EDIT_APPLICANT_USERS = 'edit-applicant-users',
  DELETE_APPLICANT_USERS = 'delete-applicant-users',

  VIEW_ENTITY_USERS = 'view-entity-users',
  SHOW_ENTITY_USERS = 'show-entity-users',
  CREATE_ENTITY_USERS = 'create-entity-users',
  EDIT_ENTITY_USERS = 'edit-entity-users',
  DELETE_ENTITY_USERS = 'delete-entity-users',

  // Roles & Permissions
  VIEW_ROLES = 'view-roles',
  SHOW_ROLES = 'show-roles',
  CREATE_ROLES = 'create-roles',
  EDIT_ROLES = 'edit-roles',
  DELETE_ROLES = 'delete-roles',

  // Quality Checks
  VIEW_QUALITY_CHECKS = 'view-quality-checks',
  SHOW_QUALITY_CHECKS = 'show-quality-checks',
  REQUEST_QUALITY_CHECKS = 'request-quality-checks',
  APPROVE_QUALITY_CHECKS = 'approve-quality-checks',
  REJECT_QUALITY_CHECKS = 'reject-quality-checks',

  // Audit Logs
  VIEW_AUDIT_TALENT = 'view-audit-talent-applications',
  VIEW_AUDIT_ENTREPRENEUR = 'view-audit-entrepreneur-applications',
  VIEW_AUDIT_INVESTOR = 'view-audit-investor-applications',
  VIEW_AUDIT_EXECUTIVE = 'view-audit-executive-applications',
  VIEW_AUDIT_CATEGORIES = 'view-audit-categories',
  VIEW_AUDIT_SUB_CATEGORIES = 'view-audit-sub-categories',
  VIEW_AUDIT_SECTORS = 'view-audit-sectors',
  VIEW_AUDIT_ACTIVITIES = 'view-audit-activities',
  VIEW_AUDIT_SUB_ACTIVITIES = 'view-audit-sub-activities',
  VIEW_AUDIT_ENTITIES = 'view-audit-entities',
  VIEW_AUDIT_INCUBATORS = 'view-audit-incubators',
  VIEW_AUDIT_FORM_FIELDS = 'view-audit-form-fields',
  VIEW_AUDIT_STAGES = 'view-audit-stages',
  VIEW_AUDIT_STAGE_STATUSES = 'view-audit-stage-statuses',
  VIEW_AUDIT_USERS = 'view-audit-admin-users',
  VIEW_AUDIT_ROLES = 'view-audit-roles',
  VIEW_DELETED_AUDIT = 'view-deleted-audit',

  // Promotional Emails
  VIEW_PROMOTIONAL_EMAILS = 'view-promotional-emails',
  DELETE_PROMOTIONAL_EMAILS = 'delete-promotional-emails',

  // Dashboard Access
  VIEW_TALENT_APPLICATION_STATISTICS = 'view-talent-application-statistacs',
  VIEW_ENTREPRENEUR_APPLICATION_STATISTICS = 'view-entrepreneur-application-statistics',
  VIEW_INVESTOR_APPLICATION_STATISTICS = 'view-investor-application-statistics',
  VIEW_EXECUTIVE_APPLICATION_STATISTICS = 'view-executive-application-statistics',
  VIEW_TALENT_CATEGORY_STATISTICS = 'view-talent-category-statistacs',
  VIEW_ENTREPRENEUR_CATEGORY_STATISTICS = 'view-entrepreneur-category-statistacs',
  VIEW_INVESTOR_CATEGORY_STATISTICS = 'view-investor-category-statistacs',
  VIEW_EXECUTIVE_CATEGORY_STATISTICS = 'view-executive-category-statistacs',
  VIEW_TALENT_ENTITIES_PERFORMANCE_STATISTICS = 'view-talent-entities-performance-statistacs',
  VIEW_ENTREPRENEUR_ENTITIES_PERFORMANCE_STATISTICS = 'view-entrepreneur-entities-performance-statistacs',
  VIEW_INVESTOR_ENTITIES_PERFORMANCE_STATISTICS = 'view-investor-entities-performance-statistacs',
  VIEW_EXECUTIVE_ENTITIES_PERFORMANCE_STATISTICS = 'view-executive-entities-performance-statistacs',
  VIEW_MONTHLY_STATISTICS = 'view-monthly-statistacs',

  // Statuse
  VIEW_APPLICATION_STATUSES = 'view-application-statuses',
  VIEW_JUSOUR_STATUSES = 'view-jusour-statuses',
  VIEW_ENTITY_STATUSES = 'view-entity-statuses',
  VIEW_MOCI_STATUSES = 'view-moci-statuses',
  VIEW_VFS_STATUSES = 'view-vfs-statuses',
  VIEW_MOL_STATUSES = 'view-mol-statuses',
  VIEW_HAYYA_STATUSES = 'view-hayya-statuses'
}

// Permission Groups for common operations
export const PermissionGroups = {
  // Full CRUD access for applications
  TALENT_FULL_ACCESS: [
    Permission.VIEW_TALENT,
    Permission.CREATE_TALENT,
    Permission.EDIT_TALENT,
    Permission.DELETE_TALENT,
    Permission.APPROVE_TALENT
  ],

  ENTREPRENEUR_FULL_ACCESS: [
    Permission.VIEW_ENTREPRENEUR,
    Permission.CREATE_ENTREPRENEUR,
    Permission.EDIT_ENTREPRENEUR,
    Permission.DELETE_ENTREPRENEUR,
    Permission.APPROVE_ENTREPRENEUR
  ],

  INVESTOR_FULL_ACCESS: [
    Permission.VIEW_INVESTOR,
    Permission.CREATE_INVESTOR,
    Permission.EDIT_INVESTOR,
    Permission.DELETE_INVESTOR,
    Permission.APPROVE_INVESTOR
  ],

  EXECUTIVE_FULL_ACCESS: [
    Permission.VIEW_EXECUTIVE,
    Permission.CREATE_EXECUTIVE,
    Permission.EDIT_EXECUTIVE,
    Permission.DELETE_EXECUTIVE,
    Permission.APPROVE_EXECUTIVE
  ],

  // Master data management
  MASTER_DATA_FULL_ACCESS: [
    Permission.VIEW_CATEGORIES,
    Permission.CREATE_CATEGORIES,
    Permission.EDIT_CATEGORIES,
    Permission.DELETE_CATEGORIES,
    Permission.VIEW_SUB_CATEGORIES,
    Permission.CREATE_SUB_CATEGORIES,
    Permission.EDIT_SUB_CATEGORIES,
    Permission.DELETE_SUB_CATEGORIES,
    Permission.VIEW_SECTORS,
    Permission.CREATE_SECTORS,
    Permission.EDIT_SECTORS,
    Permission.DELETE_SECTORS,
    Permission.VIEW_ACTIVITIES,
    Permission.CREATE_ACTIVITIES,
    Permission.EDIT_ACTIVITIES,
    Permission.DELETE_ACTIVITIES
  ],

  // User management
  USER_MANAGEMENT_FULL_ACCESS: [
    Permission.VIEW_ADMIN_USERS,
    Permission.CREATE_ADMIN_USERS,
    Permission.EDIT_ADMIN_USERS,
    Permission.DELETE_ADMIN_USERS,
    Permission.VIEW_ROLES,
    Permission.CREATE_ROLES,
    Permission.EDIT_ROLES,
    Permission.DELETE_ROLES
  ],

  // Read-only access
  READ_ONLY_APPLICATIONS: [
    Permission.VIEW_TALENT,
    Permission.VIEW_ENTREPRENEUR,
    Permission.VIEW_INVESTOR,
    Permission.VIEW_EXECUTIVE
  ],

  // Audit access
  AUDIT_ACCESS: [
    Permission.VIEW_AUDIT_TALENT,
    Permission.VIEW_AUDIT_ENTREPRENEUR,
    Permission.VIEW_AUDIT_INVESTOR,
    Permission.VIEW_AUDIT_EXECUTIVE,
    Permission.VIEW_DELETED_AUDIT
  ],
  DASH_ACCESS: [
    Permission.VIEW_TALENT_APPLICATION_STATISTICS,
    Permission.VIEW_ENTREPRENEUR_APPLICATION_STATISTICS,
    Permission.VIEW_INVESTOR_APPLICATION_STATISTICS,
    Permission.VIEW_EXECUTIVE_APPLICATION_STATISTICS,
    Permission.VIEW_TALENT_CATEGORY_STATISTICS,
    Permission.VIEW_ENTREPRENEUR_CATEGORY_STATISTICS,
    Permission.VIEW_INVESTOR_CATEGORY_STATISTICS,
    Permission.VIEW_EXECUTIVE_CATEGORY_STATISTICS,
    Permission.VIEW_TALENT_ENTITIES_PERFORMANCE_STATISTICS,
    Permission.VIEW_ENTREPRENEUR_ENTITIES_PERFORMANCE_STATISTICS,
    Permission.VIEW_INVESTOR_ENTITIES_PERFORMANCE_STATISTICS,
    Permission.VIEW_EXECUTIVE_ENTITIES_PERFORMANCE_STATISTICS
  ]
};