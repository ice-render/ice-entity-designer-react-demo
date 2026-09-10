/**
 * 初始示例模型（等价于 designer.serializeProject() 的输出）。
 *
 * 结构：
 *   User 1—1 UserProfile
 *   User N—N Role
 *   Role N—N Permission
 *   Customer 1—N Order
 */

const pk = (name = 'id') => ({ name, type: 'number', length: 64, primary: true, autoIncrement: true, nullable: false });
const fk = (name) => ({ name, type: 'number', length: 64, foreignKey: true, nullable: false, index: true });
const str = (name, length, extra = {}) => ({ name, type: 'string', length, ...extra });
const num = (name, length, extra = {}) => ({ name, type: 'number', length, ...extra });

export const seedProject = {
  version: 1,
  entities: [
    {
      id: 'e-user',
      left: 60,
      top: 60,
      entityName: 'User',
      fields: [
        pk(),
        str('username', 64, { unique: true, nullable: false }),
        str('email', 128, { unique: true, nullable: false }),
        { name: 'enabled', type: 'boolean', nullable: false, default: true },
      ],
    },
    {
      id: 'e-profile',
      left: 460,
      top: 60,
      entityName: 'UserProfile',
      fields: [
        pk(),
        { ...fk('userId'), unique: true },
        str('avatar', 255, { nullable: true }),
        str('bio', 255, { nullable: true, comment: '个人简介' }),
      ],
    },
    {
      id: 'e-role',
      left: 60,
      top: 360,
      entityName: 'Role',
      fields: [pk(), str('roleName', 64, { unique: true, nullable: false }), str('roleCode', 64, { nullable: false }), str('description', 255, { nullable: true })],
    },
    {
      id: 'e-perm',
      left: 460,
      top: 360,
      entityName: 'Permission',
      fields: [pk(), str('permName', 64, { nullable: false }), str('permCode', 64, { unique: true, nullable: false }), str('resource', 128, { nullable: false })],
    },
    {
      id: 'e-customer',
      left: 800,
      top: 60,
      entityName: 'Customer',
      fields: [pk(), str('name', 128, { nullable: false }), str('email', 128, { unique: true, nullable: false }), str('phone', 32, { nullable: true, comment: '电话' })],
    },
    {
      id: 'e-order',
      left: 800,
      top: 360,
      entityName: 'Order',
      fields: [
        pk(),
        str('orderNo', 64, { unique: true, nullable: false }),
        fk('customerId'),
        { name: 'amount', type: 'decimal', length: '12,2', nullable: false, default: '0' },
        str('status', 32, { nullable: false, default: "'created'" }),
      ],
    },
  ],
  relations: [
    {
      id: 'r-user-profile',
      relationType: 'one-to-one',
      sourceField: 'id',
      targetField: 'userId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      links: { start: { id: 'e-user', position: 'R' }, end: { id: 'e-profile', position: 'L' } },
    },
    {
      id: 'r-user-role',
      relationType: 'many-to-many',
      sourceField: 'id',
      targetField: 'id',
      joinTableName: 'user_roles',
      links: { start: { id: 'e-user', position: 'B' }, end: { id: 'e-role', position: 'T' } },
    },
    {
      id: 'r-role-perm',
      relationType: 'many-to-many',
      sourceField: 'id',
      targetField: 'id',
      joinTableName: 'role_permissions',
      links: { start: { id: 'e-role', position: 'R' }, end: { id: 'e-perm', position: 'L' } },
    },
    {
      id: 'r-customer-order',
      relationType: 'one-to-many',
      sourceField: 'id',
      targetField: 'customerId',
      links: { start: { id: 'e-customer', position: 'B' }, end: { id: 'e-order', position: 'T' } },
    },
  ],
};

export const seedProjectJson = JSON.stringify(seedProject);
