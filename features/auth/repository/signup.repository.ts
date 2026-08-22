import { db } from "@/lib/db";

export class SignupRepository {

  static async findUserByEmail(email: string) {
    return db.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }


  static async createStudentAccount(data: {
    code: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
    password: string;
  }) {

    const organization =
      await db.organization.findUnique({
        where:{
          slug:"american-council",
        },
      });


    if(!organization){
      throw new Error(
        "Default organization not found."
      );
    }


    return db.$transaction(async(tx)=>{


      const user =
        await tx.user.create({
          data:{
            code:data.code,
            firstName:data.firstName,
            lastName:data.lastName || null,
            email:data.email,
            phone:data.phone,
            password:data.password,

            role:"STUDENT",
            status:"ACTIVE",

            organizationId: organization.id,
            branchId:null,

            emailVerified:false,
          },
        });



      const existingStudent =
        await tx.student.findFirst({
          where:{
            organizationId: organization.id,
            email:data.email,
            deletedAt:null,
          },
        });



      if(existingStudent){

        await tx.student.update({
          where:{
            id:existingStudent.id,
          },
          data:{
            userId:user.id,
          },
        });


      }else{


        const lastStudent =
          await tx.student.findFirst({
            orderBy:{
              createdAt:"desc",
            },
            select:{
              studentId:true,
            },
          });



        let nextNumber=1;


        if(lastStudent?.studentId){

          nextNumber =
            Number(
              lastStudent.studentId.replace(
                "STD-",
                ""
              )
            ) + 1;

        }



        const studentId =
          `STD-${String(nextNumber).padStart(6,"0")}`;



        await tx.student.create({

          data:{

            userId:user.id,

            organizationId:
              organization.id,

            branchId:null,

            studentId,

            firstName:data.firstName,

            lastName:
              data.lastName || null,

            email:data.email,

            phone:data.phone,

          },

        });

      }



      return user;

    });

  }

}
