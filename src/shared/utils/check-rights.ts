import { Role } from '~modules/auth/enums/role.enum';
import { UserDocument } from '~modules/users/user.schema';
import { Rights } from '~shared/enums/rights.enum';
import { UserRights } from '~shared/schemas/user-rights.schema';

export function checkRights(
  document: UserRights[],
  currentUser: UserDocument,
  rights: Rights[] = null,
): boolean {
  if (currentUser.roles.includes(Role.ADMIN)) {
    return true;
  }

  const userRights = document.find((right) => right.user.id === currentUser.id);

  if (!userRights) {
    return false;
  }
  if (rights === null) {
    return true;
  }

  return rights.some((right) => userRights.rights.includes(right));
}
