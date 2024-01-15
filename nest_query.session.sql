-- Active: 1696281578915@@127.0.0.1@5432@nest_query@public

-- postgresql

select c.*,cc.title as category_title,
ch.title as chapter_title,
a.username as register_username
from
course as c
left join course_category cc on c.category_id = cc.id
left join chapter ch on c.id = ch.course_id
left join admin a on c.teacher_id = a.id
order by c.title

select * from chapter

select * from episode

select c.*,
cc.title as category_title,
a.username as register_username,
case when ch.title ISNULL
then 'any chapter does not exist'
else ch.title
end as chapter_title
from
course as c
left join course_category cc on c.category_id = cc.id
left join chapter ch on c.id = ch.course_id
left join admin a on c.teacher_id = a.id
order by c.id desc

select c.*,
cc.title as category_title,
a.username as register_username,
ch.*
from
course as c
left join course_category cc on c.category_id = cc.id
left join chapter ch on c.id = ch.course_id
left join admin a on c.teacher_id = a.id
order by c.id desc


select c.*,
    cc.title as category_title,
    a.username as register_username,
    case when ch.title ISNULL
    then 'chapter_title does not exist'
    else ch.title
    end as chapter_title,
    case when ch.text ISNULL
    then 'chapter_text does not exist'
    else ch.text
    end as chapter_text,
    case when e.title ISNULL
    then 'episode_title does not exist'
    else e.title
    end as episode_title,
    case when e.text ISNULL
    then 'episode_text does not exist'
    else e.text
    end as episode_text,
    case when e.type ISNULL
    then 'episode_type does not exist'
    else e.type
    end as episode_type,
    case when e.time ISNULL
    then '0'
    else e.time
    end as episode_time,
    case when e.video_address ISNULL
    then 'episode_address does not exist'
    else e.video_address
    end as episode_video_address
    from
    course as c
    left join course_category cc on c.category_id = cc.id
    left join chapter ch on c.id = ch.course_id
    left join episode e on ch.id = e.chapter_id
    left join admin a on c.teacher_id = a.id

    select c.*,
    array(select ch.id from chapter ch where c.id = ch.course_id) as chapters
    from
    course as c

    select c.*,
    a.username as teacher_name,
    cc.title as category_title,
    (
        select array_to_json(array_agg(row_to_json(t)))
        from (
            select ch.id,ch.title,ch.text, (
            select array_to_json(array_agg(row_to_json(t)))
            from (
                select
                e.id,e.title,e.text,e.type,
                e.time,e.video_address
                from episode e
                where e.chapter_id = ch.id
            ) t
            ) as episodes
            from chapter ch
            where ch.course_id = c.id
        ) t
    ) as chapters
    from
    course as c
    left join admin a on c.teacher_id = a.id
    left join course_category cc on cc.id = c.category_id
    where c.id = 1


    select c.*,
     (
        select array_to_json(array_agg(row_to_json(t)))
        from (
            select u.username
            from users u
            where u.id = uc.user_id
        ) t
    ) as users
    from course as c
    left join users_courses uc on c.id = uc.course_id
    where c.id = 3

    select u.*,
     coalesce(
        (
            select array_to_json(array_agg(row_to_json(t)))
        from (
            select c.title
            from course c
            where c.id = uc.course_id
        ) t
        ),
        '[]'::json
    ) as favorites_courses
    from users as u
    left join users_courses uc on u.id = uc.user_id
    where u.id = 3


    select u.* from users u


    select cc.* from course_category cc



    select
    u.id,
    u.first_name,
    u.last_name,
    u.username,
    u.mobile,
    u.email,
    b.title as blog_title
    from users as u 
    left join users_blogs ub on u.id = ub.user_id
    left join blog b on ub.blog_id = b.id
    where u.email = 'jinx@gmail.com'
    limit 1
    

    select c.*,
    a.username as teacher_name,
    cc.title as category_title,
    coalesce(
    (
        select array_to_json(array_agg(row_to_json(t)))
        from (
            select ch.id,ch.title,ch.text, 
            coalesce(
            (
            select array_to_json(array_agg(row_to_json(t)))
            from (
                select
                e.id,e.title,e.text,e.type,
                e.time,e.video_address
                from episode e
                where e.chapter_id = ch.id
            ) t
            ),
            '[]'::json
            ) as episodes
            from chapter ch
            where ch.course_id = c.id
        ) t
    ),
    '[]'::json
    ) as chapters
    from
    course as c
    left join admin a on c.teacher_id = a.id
    left join course_category cc on cc.id = c.category_id
    where c.id = 5

    select ch.*,a.username as admin_username,c.title as category_title
    from chapter ch
    left join admin a on a.id = ch.user_id
    left join course c on c.id = ch.course_id
    where a.username = 'cyrus'
    order by ch.id desc

    select ch.*,a.username as admin_username,c.title as category_title
    from chapter ch
    left join admin a on a.id = ch.user_id
    left join course c on c.id = ch.course_id
    where c.title like 'test'
    order by ch.id desc

    select ch.*,a.username as admin_username,c.title as category_title
    from chapter ch
    left join admin a on a.id = ch.user_id
    left join course c on c.id = ch.course_id
    order by ch.id desc

        select ch.*,a.username as admin_username,c.title as course_title,
        coalesce(
            (
            select array_to_json(array_agg(row_to_json(t)))
            from (
                select
                e.id,e.title,e.text,e.type,
                e.time,e.video_address
                from episode e
                where e.chapter_id = ch.id
            ) t
            ),
            '[]'::json
            ) as episodes
        from
        chapter as ch
        left join admin a on ch.user_id = a.id
        left join course c on c.id = ch.course_id
        where ch.id = 1

        delete from chapter where id = 3

        update chapter set title = 'ddd', text = 'ddd' where id = 4

        select e.*,a.username as register_name,ch.title as chapter_title
        from episode e
        left join admin a on e.user_id = a.id
        left join chapter ch on ch.id = e.chapter_id
        order by id desc
        limit 1

        select e.*,a.username as register_name,ch.title as chapter_title
        from episode e
        left join admin a on e.user_id = a.id
        left join chapter ch on ch.id = e.chapter_id
        where a.username = 'cyrus'
        order by id desc

        select e.*,a.username as register_name,ch.title as chapter_title
        from episode e
        left join admin a on e.user_id = a.id
        left join chapter ch on ch.id = e.chapter_id
        where e.id = 1

        select e.*,a.username as register_name,ch.title as chapter_title
        from episode e
        left join admin a on e.user_id = a.id
        left join chapter ch on ch.id = e.chapter_id
        where e.time >= '0 : 00 : 00' and e.time <= '0 : 4 : 00'
        order by id desc


        select e.* from episode e
        where e.time between '0:00:00' and '0:03:56'
        order by id desc;

        select pc.*,a.username as register_name from product_category pc
        left join admin a on pc.register_id = a.id
        where a.username = 'cyrus'
        order by id desc

        select pc.*,a.username as register_name from product_category pc
        left join admin a on pc.register_id = a.id
        order by id desc
        limit 1

        select pc.*,a.username as register_name from product_category pc
        left join admin a on pc.register_id = a.id
        order by id desc
        offset 1

        select pc.*,a.username as register_name from product_category pc
        left join admin a on pc.register_id = a.id
        where pc.id = 1

        select p.*,
        a.username as supplier_name,
        pc.title as product_category_title 
        from products p
        left join admin a on p.supplier_id = a.id
        left join product_category pc on pc.id = p.category_id
        order by p.id desc

        select p.*,
        a.username as supplier_name,
        pc.title as product_category_title 
        from products p
        left join admin a on p.supplier_id = a.id
        left join product_category pc on pc.id = p.category_id
        where p.title like '%${chapter_title_split_join}%'
        where p.short_title like '%${chapter_title_split_join}%'
        where p.text like '%${chapter_title_split_join}%'
        where p.short_text like '%${chapter_title_split_join}%'
        order by p.id desc

        select p.*,
        a.username as supplier_name,
        pc.title as product_category_title 
        from products p
        left join admin a on p.supplier_id = a.id
        left join product_category pc on pc.id = p.category_id
        where p.tags like '%${chapter_title_split_join}%'
        order by p.id desc

        select p.*,
        a.username as supplier_name,
        pc.title as product_category_title 
        from products p
        left join admin a on p.supplier_id = a.id
        left join product_category pc on pc.id = p.category_id
        where a.username like '%${register_name_split_join}%'
        order by p.id desc

        select p.*,
        a.username as supplier_name,
        pc.title as product_category_title 
        from products p
        left join admin a on p.supplier_id = a.id
        left join product_category pc on pc.id = p.category_id
        order by p.id desc
        limit 1

        select p.*,
        a.username as supplier_name,
        pc.title as product_category_title 
        from products p
        left join admin a on p.supplier_id = a.id
        left join product_category pc on pc.id = p.category_id
        order by p.id desc
        offset 1

        select p.*,
        a.username as supplier_name,
        pc.title as product_category_title 
        from products p
        left join admin a on p.supplier_id = a.id
        left join product_category pc on pc.id = p.category_id
        order by p.id desc
        offset 1
        limit 1

        select p.*,
        a.username as supplier_name,
        pc.title as product_category_title 
        from products p
        left join admin a on p.supplier_id = a.id
        left join product_category pc on pc.id = p.category_id
        where p.title ilike '%an%'
        order by p.id desc

        UPDATE products p
        SET p.title = '${title}',
        p.short_title = '${short_title}',
        p.text = '${text}',
        p.short_text = '${short_text}',
        p.price = 0,
        p.discount = 0,
        p.count = 0
        where p.id = 2 
        RETURNING p.*

        select c.*,
        u.username as username,
        b.title as blog_title,
        co.title as course_title,
        p.title as product_title
        from comment c
        left join blog b on b.id = c.blog_id
        left join course co on co.id = c.course_id
        left join products p on p.id = c.product_id
        left join users u on u.id = c.user_id
        order by c.id desc

        select c.*,
        u.username as username,
        b.title as blog_title,
        co.title as course_title,
        p.title as product_title
        from comment c
        left join blog b on b.id = c.blog_id
        left join course co on co.id = c.course_id
        left join products p on p.id = c.product_id
        left join users u on u.id = c.user_id
        where u.username like '%l%'
        order by c.id desc

        select c.*,
        u.username as username,
        b.title as blog_title,
        co.title as course_title,
        p.title as product_title
        from comment c
        left join blog b on b.id = c.blog_id
        left join course co on co.id = c.course_id
        left join products p on p.id = c.product_id
        left join users u on u.id = c.user_id
        order by c.id desc
        limit 1

        select c.*,
        u.username as username,
        b.title as blog_title,
        co.title as course_title,
        p.title as product_title
        from comment c
        left join blog b on b.id = c.blog_id
        left join course co on co.id = c.course_id
        left join products p on p.id = c.product_id
        left join users u on u.id = c.user_id
        order by c.id desc
        offset 1

        select c.*,
        u.username as username,
        b.title as blog_title,
        co.title as course_title,
        p.title as product_title
        from comment c
        left join blog b on b.id = c.blog_id
        left join course co on co.id = c.course_id
        left join products p on p.id = c.product_id
        left join users u on u.id = c.user_id
        order by c.id desc
        offset 1
        limit 1

        select c.*,
        u.username as username,
        b.title as blog_title
        from comment c
        left join blog b on b.id = c.blog_id
        left join users u on u.id = c.user_id
        where b.title like '%f%'
        order by c.id desc

        select c.*,
        u.username as username,
        co.title as course_title
        from comment c
        left join course co on co.id = c.course_id
        left join users u on u.id = c.user_id
        where co.title like '%es%'
        order by c.id desc

        select c.*,
        u.username as username,
        p.title as product_title
        from comment c
        left join products p on p.id = c.product_id
        left join users u on u.id = c.user_id
        where p.title like '%ny%'
        order by c.id desc

        select c.*,
        u.username as username,
        b.title as blog_title,
        co.title as course_title,
        p.title as product_title
        from comment c
        left join blog b on b.id = c.blog_id
        left join course co on co.id = c.course_id
        left join products p on p.id = c.product_id
        left join users u on u.id = c.user_id
        where c.id = 1

        update comment set comment = 'ddd', score = 4 where id = 4

        delete from comment where id = 3

        update comment set
        show = 1
        where id = 4
        returning *

        select * from comment where show = 1

        select blog.*,
        a.username as register_name,bc.title as category_title
        from blog
        left join admin a on blog.author_id = a.id
        left join blog_category bc on blog.category_id = bc.id
        order by blog.id desc

        -- mysql

        
        SELECT
        cp.id AS cartPackageId,
        cp.code AS cartPackageCode,
        cp.courierPlateNumber AS cartPackageCourierPlateNumber,
        cp.courierMobNumber AS cartPackageCourierMobNumber,
        cp.sendTime AS cartPackageSendTime,
        cp.sendDate AS cartPackageSendDate,
        cp.shipmentCode AS cartPackageShipmentCode,
        cp.isPaid AS cartPackageIsPaid,
        cp.shopId AS shopId,
        cp.deliveryTime AS deliveryTime,
        cp.deliveryDate AS deliveryDate,
        cp.status AS cartPackageStatus,
        cp.createdAt AS cartPackageCreatedAt,
        ci.id AS cartItemId,
        ci.productId AS productId,
        ci.diversityId AS diversityId,
        ci.quantity AS quantity,
        ci.status AS cartItemStatus,
        ci.listStatus AS cartItemListStatus,
        ci.createdAt AS cartItemCreatedAt,
        ci.updatedAt AS cartItemUpdatedAt,
        p.title AS productTitle,
        p.shop_type AS productShopType,
        p.pic AS productPic,
        p.sendTime AS sendTime,
        p.deliverySetting AS deliverySetting,
        p.freeSend AS freeSend,
        p.box_size AS boxSize,
        d.diversity AS productDiversity
        FROM
        cart_package cp
        LEFT JOIN
        cart_item ci ON ci.cartPackage = cp.id
        LEFT JOIN
        product p ON  p.id = ci.productId
        LEFT JOIN 
        diversity d ON d.id = ci.diversityId
        WHERE
            (cp.createdAt BETWEEN ${input.startTime || 0} AND ${
            input.endTime || 9999999999
            })
            AND (cp.status = "${input.status || ""}" OR "${input.status || ""}" = "")
            AND cp.isPaid = "0"
            AND cp.shopId = ${input.shopId};

-- SELECT
--         cp.id AS cartPackageId,
--         cp.code AS cartPackageCode,
--         cp.shopId AS shopId,
--         cp.deliveryTime AS deliveryTime,
--         cp.deliveryDate AS deliveryDate,
--         cp.status AS cartPackageStatus,
--         cp.createdAt AS cartPackageCreatedAt,
--         ci.id AS cartItemId,
--         ci.productId AS productId,
--         ci.diversityId AS diversityId,
--         ci.quantity AS quantity,
--         ci.status AS cartItemStatus,
--         ci.listStatus AS cartItemListStatus,
--         ci.createdAt AS cartItemCreatedAt,
--         ci.updatedAt AS cartItemUpdatedAt,
--         p.title AS productTitle,
--         p.shop_type AS productShopType,
--         p.pic AS productPic,
--         p.sendTime AS sendTime,
--         p.deliverySetting AS deliverySetting,
--         p.freeSend AS freeSend,
--         p.box_size AS boxSize
--         FROM
--         cart_package cp
--         LEFT JOIN
--         cart_item ci ON ci.cartPackage = cp.id
--         LEFT JOIN
--         product p ON  p.id = ci.productId
--         where cp.shopId = 1 
--         AND
--         isPaid = "0"

-- select cp.*,ci.* from cart_package cp
-- left join cart_item ci on ci.cartPackage = cp.id
-- where cp.shopId = 1 
-- AND
-- isPaid = "0"


-- explain analyze
-- select fo.*,
--     (
--         SELECT JSON_ARRAYAGG(
--                 JSON_OBJECT(
--                     'id',
--                     c.id,
--                     'userId',
--                     c.userId,
--                     'addressId',
--                     c.addressId,
--                     'completed',
--                     c.completed,
--                     'status',
--                     c.status,
--                     'sendTime',
--                     c.sendTime,
--                     'cart_package',
--                     (
--                         SELECT JSON_ARRAYAGG(
--                                 JSON_OBJECT(
--                                     'id',
--                                     cp.id,
--                                     'userId',
--                                     cp.userId,
--                                     'cart',
--                                     cp.cart,
--                                     'shopId',
--                                     cp.shopId,
--                                     'status',
--                                     cp.status,
--                                     'deliveryDate',
--                                     cp.deliveryDate,
--                                     'deliveryTime',
--                                     cp.deliveryTime,
--                                     'cart_items',
--                                     (
--                                         SELECT JSON_ARRAYAGG(
--                                                 JSON_OBJECT(
--                                                     'id',
--                                                     ci.id,
--                                                     'cartPackage',
--                                                     ci.cartPackage,
--                                                     'productId',
--                                                     ci.productId,
--                                                     'diversityId',
--                                                     ci.diversityId,
--                                                     'quantity',
--                                                     ci.quantity,
--                                                     'status',
--                                                     ci.status,
--                                                     'listStatus',
--                                                     ci.listStatus,
--                                                     'shopId',
--                                                     ci.shopId,
--                                                     'createdAt',
--                                                     ci.createdAt,
--                                                     'updatedAt',
--                                                     ci.updatedAt
--                                                 )
--                                             )
--                                         from cart_item ci
--                                             JOIN cart_package cp ON ci.cartPackage = cp.id
--                                         WHERE cp.cart = fo.cartId
--                                     ),
--                                     'createdAt',
--                                     cp.createdAt,
--                                     'updatedAt',
--                                     cp.updatedAt
--                                 )
--                             )
--                         from cart_package cp
--                         where cp.cart = (
--                                 SELECT c.id
--                                 FROM cart c
--                                 WHERE c.id = fo.cartId
--                             )
--                     ),
--                     'createdAt',
--                     c.createdAt,
--                     'updatedAt',
--                     c.updatedAt
--                 )
--             )
--         from cart c
--         where fo.cartId = c.id
--     ) as carts
-- from final_order fo;
-- select fo.* from final_order fo
-- left join cart c on fo.userId = c.userId
-- left join cart_package cp on cp.userId = c.userId
-- left join cart_item ci on cp.id = ci.cartPackage
-- where
-- ci.cartPackage = cp.id
-- and cp.cart = c.id
-- and fo.cartId = c.id
-- and fo.isPaid = "1"
-- select u.*,
-- coalesce(
--     (
--         select array_to_json(array_agg(row_to_json(t)))
--     from (
--         select c.title
--         from course c
--         where c.id = uc.course_id
--     ) t
--     ),
--     '[]'::json
-- ) as favorites_courses
-- from users as u
-- select fo.* from final_order fo
-- left join cart c on fo.cartId = c.id
-- left join cart_package cp on cp.cart = c.id
-- left join cart_item ci on cp.id = ci.cartPackage
-- left join return_product rp on rp.cartItemId = ci.id
-- where
-- ci.cartPackage = cp.id
-- and rp.cartItemId = ci.id
-- and cp.cart = c.id
-- and fo.cartId = c.id
-- and fo.isPaid = "1"
-- select fo.* from final_order fo
-- left join cart c on fo.cartId = c.id
-- left join cart_package cp on cp.cart = c.id
-- left join cart_item ci on cp.id = ci.cartPackage
-- left join return_product rp on rp.cartItemId = ci.id
-- where
-- rp.cartItemId = ci.id
-- and ci.cartPackage = cp.id
-- and cp.cart = c.id
-- and fo.cartId = c.id
-- and fo.isPaid = "1"
-- select rp.* from return_product rp
-- left join cart_item ci on rp.cartItemId = ci.id
-- left join cart_package cp on ci.cartPackage = cp.id
-- left join cart c on cp.cart = c.id
-- left join final_order fo on fo.cartId = c.id
-- where
-- rp.cartItemId = ci.id
-- and ci.cartPackage = cp.id
-- and cp.cart = c.id
-- and fo.cartId = c.id
-- and fo.isPaid = "1"
-- select fo.*,
-- coalesce(
--     (
--     select array_to_json(array_agg(row_to_json(t)))
--     from
--     (
--         select * from cart c
--         where c.id = fo.cart_id
--     ) t
-- ),
-- '[]'::json
-- ) as carts
-- from final_order fo
-- select *,
-- coalesce(
--     (
--         select array_to_json(array_agg(row_to_json(t)))
--         from (
--             select * from cart c
--         ) t
-- ),
--     '[]'
-- ) as carts
-- from final_order
-- select c.*,
--     a.username as teacher_name,
--     cc.title as category_title,
--     (
--         select array_to_json(array_agg(row_to_json(t)))
--         from (
--             select ch.id,ch.title,ch.text, (
--             select array_to_json(array_agg(row_to_json(t)))
--             from (
--                 select
--                 e.id,e.title,e.text,e.type,
--                 e.time,e.video_address
--                 from episode e
--                 where e.chapter_id = ch.id
--             ) t
--             ) as episodes
--             from chapter ch
--             where ch.course_id = c.id
--         ) t
--     ) as chapters
--     from
--     course as c
--     left join admin a on c.teacher_id = a.id
--     left join course_category cc on cc.id = c.category_id
--     where c.id = 1

    
