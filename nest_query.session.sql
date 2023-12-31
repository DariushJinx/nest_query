-- Active: 1696281578915@@127.0.0.1@5432@nest_query@public
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