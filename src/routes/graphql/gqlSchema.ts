/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLInterfaceType,
} from 'graphql';
import { PrismaClient } from '@prisma/client';
import { UUIDType } from './types/uuid.js';

const prisma = new PrismaClient();

const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: new GraphQLNonNull(MemberTypeId) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const Post = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  },
});
const Profile = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberType: { type: new GraphQLNonNull(MemberType) },
  },
});
// const User: GraphQLObjectType = new GraphQLObjectType({
//   name: 'User',
//   fields: () => ({
//     id: { type: new GraphQLNonNull(UUIDType) },
//     name: { type: new GraphQLNonNull(GraphQLString) },
//     balance: { type: new GraphQLNonNull(GraphQLFloat) },
//     profile: { type: Profile },
//     posts: { type: new GraphQLNonNull(new GraphQLList(Post)) },
//     userSubscribedTo: { type: new GraphQLNonNull(new GraphQLList(User)) },
//     subscribedToUser: { type: new GraphQLNonNull(new GraphQLList(User)) },
//   }),
// });

const UserInterface = new GraphQLInterfaceType({
  name: 'UserInterface',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
  resolveType: (value) => {
    if ('profile' in value || 'posts' in value) {
      return 'User';
    }
    return undefined;
  },
});

const User = new GraphQLObjectType({
  name: 'User',
  interfaces: [UserInterface],
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: { type: Profile },
    posts: { type: new GraphQLNonNull(new GraphQLList(Post)) },
    userSubscribedTo: { type: new GraphQLNonNull(new GraphQLList(User)) },
    subscribedToUser: { type: new GraphQLNonNull(new GraphQLList(User)) },
  }),
});

export { UserInterface, User };

const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});

const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeId },
  },
});

const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});

const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  },
});

const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeId) },
  },
});

const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(MemberType)),
      resolve: async () => {
        return await prisma.memberType.findMany(); // Предполагается, что в базе данных есть таблица `memberType`
      },
    },
    memberType: {
      type: MemberType,
      args: { id: { type: new GraphQLNonNull(MemberTypeId) } },
      resolve: async (_, { id }) => {
        const memberType = await prisma.memberType.findUnique({ where: { id } });
        if (!memberType) throw new Error('MemberType not found');
        return memberType;
      },
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(User)),
      resolve: async () => {
        return await prisma.user.findMany();
      },
    },
    user: {
      type: User,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }) => {
        return await prisma.user.findUnique({ where: { id } });
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(Post)),
      resolve: async () => {
        return await prisma.post.findMany();
      },
    },
    post: {
      type: Post,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }) => {
        return await prisma.post.findUnique({ where: { id } });
      },
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(Profile)),
      resolve: async () => {
        return await prisma.profile.findMany();
      },
    },
    profile: {
      type: Profile,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }) => {
        return await prisma.profile.findUnique({ where: { id } });
      },
    },
  },
});

interface CreateUserDto {
  name: string;
  balance: number;
}

const Mutations = new GraphQLObjectType({
  name: 'Mutations',
  fields: {
    createUser: {
      type: User,
      args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
      resolve: async (_: unknown, { dto }: { dto: CreateUserDto }) => {
        try {
          const user = await prisma.user.create({
            data: {
              name: dto.name,
              balance: dto.balance,
            },
          });
          return user;
        } catch (error) {
          console.error('Error creating user:', error);
          throw new Error('Failed to create user');
        }
      },
    },
    createProfile: {
      type: Profile,
      args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
      resolve: async (_: unknown, { dto }) => {
        try {
          const profile = await prisma.profile.create({
            data: {
              isMale: dto.isMale,
              yearOfBirth: dto.yearOfBirth,
              user: dto.userId,
              // user: {
              //   connect: { id: dto.userId },
              // },
              memberType: dto.memberTypeId,
              // memberType: {
              //   connect: { id: dto.memberTypeId },
              // },
            },
          });
          return profile;
        } catch (error) {
          console.error('Error creating profile:', error);
          throw new Error('Failed to create profile');
        }
      },
    },
    createPost: {
      type: Post,
      args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
      resolve: async (_, { dto }) => {
        try {
          const post = await prisma.post.create({
            data: {
              title: dto.title,
              content: dto.content,
              author: {
                connect: { id: dto.authorId }, // Ensure author exists
              },
            },
          });
          return post;
        } catch (error) {
          console.error('Error creating post:', error);
          throw new Error('Failed to create post');
        }
      },
    },
    changePost: {
      type: Post,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: async (_, { id, dto }) => {
        try {
          const updatedPost = await prisma.post.update({
            where: { id },
            data: {
              title: dto.title,
              content: dto.content,
            },
          });
          return updatedPost;
        } catch (error) {
          console.error('Error updating post:', error);
          throw new Error('Failed to update post');
        }
      },
    },
    changeProfile: {
      type: Profile,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: async (_, { id, dto }) => {
        try {
          const updatedProfile = await prisma.profile.update({
            where: { id },
            data: {
              isMale: dto.isMale,
              yearOfBirth: dto.yearOfBirth,
              memberType: {
                connect: { id: dto.memberTypeId },
              },
            },
          });
          return updatedProfile;
        } catch (error) {
          console.error('Error updating profile:', error);
          throw new Error('Failed to update profile');
        }
      },
    },
    changeUser: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: async (_, { id, dto }) => {
        try {
          const updatedUser = await prisma.user.update({
            where: { id },
            data: {
              name: dto.name,
              balance: dto.balance,
            },
          });
          return updatedUser;
        } catch (error) {
          console.error('Error updating user:', error);
          throw new Error('Failed to update user');
        }
      },
    },
    deleteUser: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }) => {
        try {
          await prisma.user.delete({ where: { id } });
          return 'User deleted successfully';
        } catch (error) {
          console.error('Error deleting user:', error);
          throw new Error('Failed to delete user');
        }
      },
    },
    deletePost: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }) => {
        try {
          await prisma.post.delete({ where: { id } });
          return 'Post deleted successfully';
        } catch (error) {
          console.error('Error deleting post:', error);
          throw new Error('Failed to delete post');
        }
      },
    },
    deleteProfile: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }) => {
        try {
          await prisma.profile.delete({ where: { id } });
          return 'Profile deleted successfully';
        } catch (error) {
          console.error('Error deleting profile:', error);
          throw new Error('Failed to delete profile');
        }
      },
    },
    subscribeTo: {
      type: GraphQLString,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { userId, authorId }) => {
        try {
          await prisma.subscribersOnAuthors.create({
            data: {
              subscriber: { connect: { id: userId } },
              author: { connect: { id: authorId } },
            },
          });
          return 'Yuppee, Subscribed successfully';
        } catch (error) {
          console.error('Error subscribing:', error);
          throw new Error('Failed to subscribe');
        }
      },
    },
    unsubscribeFrom: {
      type: GraphQLString,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { userId, authorId }) => {
        try {
          await prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: userId,
                authorId,
              },
            },
          });
          return 'Unsubscribed successfully';
        } catch (error) {
          console.error('Error unsubscribing:', error);
          throw new Error('Failed to unsubscribe');
        }
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: Mutations,
});

export default schema;
