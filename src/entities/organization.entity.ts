import { Column, Entity, ManyToMany, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent, TreeLevelColumn } from 'typeorm';

import { User } from './user.entity';

@Entity('organization')
@Tree('closure-table')
export class Organization {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * 组织名称
     */
    @Column()
    name: string;

    /**
     * 组织下的用户
     */
    @ManyToMany(type => User, user => user.organizations)
    users: User[];

    /**
     * 父组织
     */
    @TreeParent()
    parent: Organization;

    /**
     * 子组织
     */
    @TreeChildren({ cascade: true })
    children: Organization[];
}