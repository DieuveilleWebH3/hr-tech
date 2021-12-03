/* Copyright (C) 2001-2019 Artifex Software, Inc.
   All Rights Reserved.

   This software is provided AS-IS with no warranty, either express or
   implied.

   This software is distributed under license and may not be copied,
   modified or distributed except as expressly authorized under the terms
   of the license contained in the file LICENSE in this distribution.

   Refer to licensing information at http://www.artifex.com or contact
   Artifex Software, Inc.,  1305 Grant Avenue - Suite 200, Novato,
   CA 94945, U.S.A., +1(415)492-9861, for further information.
*/


/* Matrix operators */
#include "ghost.h"
#include "oper.h"
#include "igstate.h"
#include "gsmatrix.h"
#include "gscoord.h"
#include "store.h"

/* Forward references */
static int common_transform(i_ctx_t *,
                int (*)(gs_gstate *, double, double, gs_point *),
                int (*)(double, double, const gs_matrix *, gs_point *));

/* - initmatrix - */
static int
zinitmatrix(i_ctx_t *i_ctx_p)
{
    return gs_initmatrix(igs);
}

/* <matrix> defaultmatrix <matrix> */
static int
zdefaultmatrix(i_ctx_t *i_ctx_p)
{
    os_ptr op = osp;
    gs_matrix mat;

    gs_defaultmatrix(igs, &mat);
    return write_matrix(op, &mat);
}

/* - .currentmatrix <xx> <xy> <yx> <yy> <tx> <ty> */
static int
zcurrentmatrix(i_ctx_t *i_ctx_p)
{
    os_ptr op = osp;
    gs_matrix mat;
    int code = gs_currentmatrix(igs, &mat);

    if (code < 0)
        return code;
    push(6);
    code = make_floats(op - 5, &mat.xx, 6);
    if (code < 0)
        pop(6);
    return code;
}

/* <xx> <xy> <yx> <yy> <tx> <ty> .setmatrix - */
static int
zsetmatrix(i_ctx_t *i_ctx_p)
{
    os_ptr op = osp;
    gs_matrix mat;
    int code = float_params(op, 6, &mat.xx);

    if (code < 0)
        return code;
    if ((code = gs_setmatrix(igs, &mat)) < 0)
        return code;
    pop(6);
    return 0;
}

/* <matrix|null> .setdefaultmatrix - */
static int
zsetdefaultmatrix(i_ctx_t *i_ctx_p)
{
    os_ptr op = osp;
    int code;

    if (r_has_type(op, t_null))
        code = gs_setdefaultmatrix(igs, NULL);
    else {
        gs_matrix mat;

        code = read_matrix(imemory, op, &mat);
        if (code < 0)
            return code;
        code = gs_setdefaultmatrix(igs, &mat);
    }
    if (code < 0)
        return code;
    pop(1);
    return 0;
}

/* <tx> <ty> translate - */
/* <tx> <ty> <matrix> translate <matrix> */
static int
ztranslate(i_ctx_t *i_ctx_p)
{
    os_ptr op = osp;
    int code;
    double trans[2];

    if ((code = num_params(op, 2, trans)) >= 0) {
        code = gs_translate(igs, trans[0], trans[1]);
        if (code < 0)
            return code;
    } else {			/* matrix operand */
        gs_matrix mat;

        /* The num_params failure might be a stack underflow. */
        check_op(2);
        if ((code = num_params(op - 1, 2, trans)) < 0 ||
            (code = gs_make_translation(trans[0], trans[1], &mat)) < 0 ||
            (code = write_matrix(op, &mat)) < 0
            ) {			/* Might be a stack underflow. */
            check_op(3);
            return code;
        }
        op[-2] = *op;
    }
    pop(2);
    return code;
}

/* <sx> <sy> scale - */
/* <sx> <sy> <matrix> scale <matrix> */
static int
zscale(i_ctx_t *i_ctx_p)
{
    os_ptr op = osp;
    int code;
    double scale[2];

    if ((code = num_params(op, 2, scale)) >= 0) {
        code = gs_scale(igs, scale[0], scale[1]);
        if (code < 0)
            return code;
    } else {			/* matrix operand */
        gs_matrix mat;

        /* The num_params failure might be a stack underflow. */
        check_op(2);
        if ((code = num_params(op - 1, 2, scale)) < 0 ||
            (code = gs_make_scaling(scale[0], scale[1], &mat)) < 0 ||
            (code = write_matrix(op, &mat)) < 0
            ) {			/* Might be a stack underflow. */
            check_op(3);
            return code;
        }
        op[-2] = *op;
    }
    pop(2);
    return code;
}

/* <angle> rotate - */
/* <angle> <matrix> rotate <matrix> */
static int
zrotate(i_ctx_t *i_ctx_p)
{
    os_ptr op = osp;
    int code;
    double ang;

    if ((code = real_param(op, &ang)) >= 0) {
        code = gs_rotate(igs, ang);
        if (code < 0)
            return code;
    } else {			/* matrix operand */
        gs_matrix mat;

        /* The num_params failure might be a stack underflow. */
        check_op(1);
        if ((code = num_params(op - 1, 1, &ang)) < 0 ||
            (code = gs_make_rotation(ang, &mat)) < 0 ||
            (code = write_matrix(op, &mat)) < 0
            ) {			/* Might be a stack underflow. */
            check_op(2);
            return code;
        }
        op[-1] = *op;
    }
    pop(1);
    return code;
}

/* <matrix> concat - */
static int
zconcat(i_ctx_t *i_ctx_p)
{
    os_ptr op = osp;
    gs_matrix mat;
    int code = read_matrix(imemory, op, &mat);

    if (code < 0)
        return code;
    code = gs_concat(igs, &mat);
    if (code < 0)
        return code;
    pop(1);
    return 0;
}

/* <matrix1> <matrix2> <matrix> concatmatrix <matrix> */
static int
zconcatmatrix(i_ctx_t *i_ctx_p)
{
    os_ptr op = osp;
    gs_matrix m1, m2, mp;
    int code;

    if ((code = read_matrix(imemory, op - 2, &m1)) < 0 ||
        (code = read_matrix(imemory, op - 1, &m2)) < 0 ||
        (code = gs_matrix_multiply(&m1, &m2, &mp)) < 0 ||
        (code = write_matrix(op, &mp)) < 0
        )
        return code;
    op[-2] = *op;
    pop(2);
    return code;
}

/* <x> <y> transform <xt> <yt> */
/* <x> <y> <matrix> transform <xt> <yt> */
static int
ztransform(i_ctx_t *i_ctx_p)
{
    return common_transform(i_ctx_p, gs_transform, gs_point_transform);
}

/* <dx> <dy> dtransform <dxt> <dyt> */
/* <dx> <dy> <matrix> dtransform <dxt> <dyt> */
static int
zdtransform(i_ctx_t *i_ctx_p)
{
    return common_transform(i_ctx_p, gs_dtransform, gs_distance_transform);
}

/* <xt> <yt> itransform <x> <y> */
/* <xt> <yt> <matrix> itransform <x> <y> */
static int
zitransform(i_ctx_t *i_ctx_p)
{
    return common_transform(i_ctx_p, gs_itransform, gs_point_transform_inverse);
}

/* <dxt> <dyt> idtransform <dx> <dy> */
/* <dxt> <dyt> <matrix> idtransform <dx> <dy> */
static int
zidtransform(i_ctx_t *i_ctx_p)
{
    return common_transform(i_ctx_p, gs_idtransform, gs_distance_transform_inverse);
}

/* Common logic for [i][d]transform */
static int
common_transform(i_ctx_t *i_ctx_p,
        int (*ptproc)(gs_gstate *, double, double, gs_point *),
        int (*matproc)(double, double, const gs_matrix *, gs_point *))
{
    os_ptr op = osp;
    double opxy[2];
    gs_point pt;
    int code;

    /* Optimize for the non-matrix case */
    switch (r_type(op)) {
        case t_real:
            opxy[1] = op->value.realval;
            break;
        case t_integer:
            opxy[1] = (double)op->value.intval;
            break;
        case t_array:		/* might be a matrix */
        case t_shortarray:
        case t_mixedarray: {
            gs_matrix mat;
            gs_matrix *pmat = &mat;

            if ((code = read_matrix(imemory, op, pmat)) < 0 ||
                (code = num_params(op - 1, 2, opxy)) < 0 ||
                (code = (*matproc) (opxy[0], opxy[1], pmat, &pt)) < 0
                ) {		/* Might be a stack underflow. */
                check_op(3);
                return code;
            }
            op--;
            pop(1);
            goto out;
        }
        default:
            return_op_typecheck(op);
    }
    switch (r_type(op - 1)) {
        case t_real:
            opxy[0] = (op - 1)->value.realval;
            break;
        case t_integer:
            opxy[0] = (double)(op - 1)->value.intval;
            break;
        default:
            return_op_typecheck(op - 1);
    }
    if ((code = (*ptproc) (igs, opxy[0], opxy[1], &pt)) < 0)
        return code;
out:
    make_real(op - 1, pt.x);
    make_real(op, pt.y);
    return 0;
}

/* <matrix> <inv_matrix> invertmatrix <inv_matrix> */
static int
zinvertmatrix(i_ctx_t *i_ctx_p)
{
    os_ptr op = osp;
    gs_matrix m;
    int code;

    if ((code = read_matrix(imemory, op - 1, &m)) < 0 ||
        (code = gs_matrix_invert(&m, &m)) < 0 ||
        (code = write_matrix(op, &m)) < 0
        )
        return code;
    op[-1] = *op;
    pop(1);
    return code;
}

/* <bbox> <matrix> .bbox_transform <x0> <y0> <x1> <y1> */
/* Calculate bonding box of a box transformed by a matrix. */
static int
zbbox_transform(i_ctx_t *i_ctx_p)
{
    os_ptr op = osp;
    gs_matrix m;
    float bbox[4];
    gs_point aa, az, za, zz;
    double temp;
    int code;

    if ((code = read_matrix(imemory, op, &m)) < 0)
        return code;

    if (!r_is_array(op - 1))
        return_op_typecheck(op - 1);
    check_read(op[-1]);
    if (r_size(op - 1) != 4)
        return_error(gs_error_rangecheck);
    if ((code = process_float_array(imemory, op - 1, 4, bbox) < 0))
        return code;

    gs_point_transform(bbox[0], bbox[1], &m, &aa);
    gs_point_transform(bbox[0], bbox[3], &m, &az);
    gs_point_transform(bbox[2], bbox[1], &m, &za);
    gs_point_transform(bbox[2], bbox[3], &m, &zz);

    if ( aa.x > az.x)
        temp = aa.x, aa.x = az.x, az.x = temp;
    if ( za.x > zz.x)
        temp = za.x, za.x = zz.x, zz.x = temp;
    if ( za.x < aa.x)
        aa.x = za.x;  /* min */
    if ( az.x > zz.x)
        zz.x = az.x;  /* max */

    if ( aa.y > az.y)
        temp = aa.y, aa.y = az.y, az.y = temp;
    if ( za.y > zz.y)
        temp = za.y, za.y = zz.y, zz.y = temp;
    if ( za.y < aa.y)
        aa.y = za.y;  /* min */
    if ( az.y > zz.y)
        zz.y = az.y;  /* max */

    push(2);
    make_real(op - 3, (float)aa.x);
    make_real(op - 2, (float)aa.y);
    make_real(op - 1, (float)zz.x);
    make_real(op    , (float)zz.y);
    return 0;
}

/* <matrix> .currenttextlinematrix <matrix> */
static int
zcurrenttextlinematrix(i_ctx_t *i_ctx_p)
{
    os_ptr op = osp;
    gs_matrix mat;

    check_op(1);
    if (!r_has_type(op, t_array))
        return_error(gs_error_typecheck);

    gs_gettextlinematrix(igs, &mat);
    return write_matrix(op, &mat);
}

static int
zsettextlinematrix(i_ctx_t *i_ctx_p)
{
    os_ptr op = osp;
    int code;

    check_op(1);
    if (r_has_type(op, t_array)) {
        gs_matrix mat;

        code = read_matrix(imemory, op, &mat);
        if (code < 0)
            return code;
        code = gs_settextlinematrix(igs, &mat);
    } else
        code = gs_error_typecheck;

    if (code < 0)
        return code;
    pop(1);
    return 0;
}

/* <matrix> .currenttextmatrix <matrix> */
static int
zcurrenttextmatrix(i_ctx_t *i_ctx_p)
{
    os_ptr op = osp;
    gs_matrix mat;

    check_op(1);
    if (!r_has_type(op, t_array))
        return_error(gs_error_typecheck);

    gs_gettextmatrix(igs, &mat);
    return write_matrix(op, &mat);
}

static int
zsettextmatrix(i_ctx_t *i_ctx_p)
{
    os_ptr op = osp;
    int code;

    check_op(1);
    if (r_has_type(op, t_array)) {
        gs_matrix mat;

        code = read_matrix(imemory, op, &mat);
        if (code < 0)
            return code;
        code = gs_settextmatrix(igs, &mat);
    } else
        code = gs_error_typecheck;

    if (code < 0)
        return code;
    pop(1);
    return 0;
}

/* ------ Initialization procedure ------ */

const op_def zmatrix_op_defs[] =
{
    {"1concat", zconcat},
    {"2dtransform", zdtransform},
    {"3concatmatrix", zconcatmatrix},
    {"0.currentmatrix", zcurrentmatrix},
    {"1defaultmatrix", zdefaultmatrix},
    {"2idtransform", zidtransform},
    {"0initmatrix", zinitmatrix},
    {"2invertmatrix", zinvertmatrix},
    {"2itransform", zitransform},
    {"1rotate", zrotate},
    {"2scale", zscale},
    {"6.setmatrix", zsetmatrix},
    {"1.setdefaultmatrix", zsetdefaultmatrix},
    {"2transform", ztransform},
    {"2translate", ztranslate},
    op_def_end(0)
};

const op_def zmatrix2_op_defs[] =
{
    {"2.bbox_transform", zbbox_transform},
    {"1.currenttextlinematrix", zcurrenttextlinematrix},
    {"1.settextlinematrix", zsettextlinematrix},
    {"1.currenttextmatrix", zcurrenttextmatrix},
    {"1.settextmatrix", zsettextmatrix},
    op_def_end(0)
};
