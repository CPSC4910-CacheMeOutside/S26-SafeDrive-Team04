import { post, del, get} from "aws-amplify/api";
import { fetchAuthSession } from "aws-amplify/auth";


async function getID(){
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
}

export async function fetchAdminUsers() {
  const idToken = await getID();

  const restOperation = get({
    apiName: "SafeDriveAPI",
    path: "/admin/users/group/Admin",
    options: {
      headers: {
        Authorization: idToken,
      },
    },
  });

  const { body } = await restOperation.response;
  return await body.json();
}
export async function createUser({
    username,
    email,
    temporaryPassword,
    group,
    name,
    phone_number,
}){
    const idToken = await getID();


    const restOperation = post({
        apiName: "SafeDriveAPI",
        path: "/admin/users",
        options: {
            headers:{
                Authorization: idToken,
            },
            body: {
                username,
                email,
                temporaryPassword,
                group,
                name,
                phone_number,
            },
        },
    });

    const response = await restOperation.response;
    return await response.body.json();
}


export async function deleteUser(username){
    const idToken = await getID();

    const restOperation = del({
        apiName: "SafeDriveAPI",
        path: `/admin/users/${encodeURIComponent(username)}`,
        options: {
            headers: {
                Authorization: idToken,
            },
        },
    });
    const response = await restOperation.response;
    return await response.body.json();
}
