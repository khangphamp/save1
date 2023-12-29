
export const PERMISSIONS = {
    DASHBOARD: 'DASHBOARD',
    BILLBANK: 'BILLBANK',
}

class Permission {
    permission = null // Quyền
    descriptions = null // Mô tả
    active = 0
    children = [];

    constructor(permission, descriptions, children = null) {
        this.permission = permission;
        this.descriptions = descriptions
        this.children = children
    }
}

const getPermissionsTree = (permissionsList) => {
    const permissionsTree = [
        new Permission(PERMISSIONS.DASHBOARD, 'Trang chủ'),
    ]
    function permisionsRecursive(persTree) {
        persTree.forEach(per => {
            if (permissionsList.includes(per.permission)) {
                per.active = 1;
            }
            if (per.children) {
                permisionsRecursive(per.children)
            }
        });
    }
    permisionsRecursive(permissionsTree)
    return permissionsTree
}

export default getPermissionsTree;


export const PERMISSIONS_LIST = Object.values(PERMISSIONS)

