/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import DataLoader from 'dataloader';

export const memberTypeLoader = (prisma) => {
  return new DataLoader(async (ids: readonly string[]) => {
    const memberTypes = await prisma.memberType.findMany({
      where: { id: { in: [...ids] } },
    });

    return ids.map((id) => memberTypes.find((type) => id === type.id));
  });
};

export const userLoader = (prisma) => {
  return new DataLoader(async (ids: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: { id: { in: [...ids] } },
      include: {
        subscribedToUser: true,
        userSubscribedTo: true,
      },
    });

    return ids.map((id) => users.find((user) => id === user.id));
  });
};

export const profileLoader = (prisma, type) => {
  return new DataLoader(async (ids: readonly string[]) => {
    const profiles = await prisma.profile.findMany({
      where: { [type]: { in: [...ids] } },
    });

    return ids.map((id) => profiles.find((profile) => id === profile[type]));
  });
};

export const postLoader = (prisma) => {
  return new DataLoader(async (ids: readonly string[]) => {
    const posts = await prisma.post.findMany({
      where: { id: { in: [...ids] } },
    });

    return ids.map((id) => posts.find((post) => id === post.id));
  });
};

export const postsByAuthorLoader = (prisma) => {
  return new DataLoader(async (ids: readonly string[]) => {
    const posts = await prisma.post.findMany({
      where: { authorId: { in: [...ids] } },
    });

    const postsWAuthors = posts.reduce((acc, post) => {
      const key = post.authorId;
      acc[key] = acc[key] ? [...acc[key], post] : [post];
      return acc;
    }, {});

    return ids.map((id) => postsWAuthors[id] || []);
  });
};

export const includeLoaders = (prisma) => {
  return {
    prisma,
    memberTypeLoader: memberTypeLoader(prisma),
    userLoader: userLoader(prisma),
    profileByIdLoader: profileLoader(prisma, 'id'),
    profileByUserIdLoader: profileLoader(prisma, 'userId'),
    postLoader: postLoader(prisma),
    postsByAuthorLoader: postsByAuthorLoader(prisma),
  };
};
